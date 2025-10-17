import { ethers, Contract } from 'ethers';
import { getProviderFromNetwork, Network } from '@notional-finance/util';
import { RiskyPosition, EnrichedPosition, Env, Position, TokenPrice } from './types';
import { fetchPositions } from './utils/dataService';
import { MorphoRouterIntegration } from './utils/morphoRouter';
import { getWithdrawRequestData } from './utils/withdrawRequestData';
import { VaultRegistry } from './utils/vaultRegistry';
import { FLASH_LIQUIDATOR_ABI, TRADING_MODULE_ABI } from './abis';
import { generateRedeemData } from './utils/redeemDataGenerator';
import { getTokenPrices } from './utils/tokenPricing';
import { LiquidatorLogger } from './utils/logging';

export default class ExponentLiquidator {
  private provider: ethers.providers.Provider;
  private morphoRouterIntegration: MorphoRouterIntegration;
  private logger: LiquidatorLogger;
  private vaultRegistry?: VaultRegistry;
  private flashLiquidator: Contract;
  private tradingModule: Contract;
  private network: Network;

  constructor(private env: Env) {
    this.network = env.NETWORK;
    this.provider = getProviderFromNetwork(env.NETWORK, true);
    this.morphoRouterIntegration = new MorphoRouterIntegration(
      this.provider,
      env.MORPHO_LENDING_ROUTER_ADDRESS
    );
    this.logger = new LiquidatorLogger(env);
    this.flashLiquidator = new ethers.Contract(
      env.FLASH_LIQUIDATOR_ADDRESS,
      FLASH_LIQUIDATOR_ABI,
      this.provider
    );
    this.tradingModule = new ethers.Contract(
      env.TRADING_MODULE_ADDRESS,
      TRADING_MODULE_ABI,
      this.provider
    );
  }

  async fetchPositions(): Promise<Position[]> {
    // Step 1: Get account/vault pairs from data service
    return await fetchPositions(
      this.env.DATA_SERVICE_URL,
      this.env.DATA_SERVICE_AUTH_TOKEN
    );
  }

  async initializeVaultRegistry(positions: Position[]): Promise<void> {
    // Initialize vault registry with unique vault addresses from positions
    const uniqueVaultAddresses = [...new Set(positions.map(([_, vault]) => vault))];
    this.vaultRegistry = await VaultRegistry.initialize(
      uniqueVaultAddresses,
      this.provider,
      this.env.NETWORK
    );
  }

  async getRiskyPositions(positions: Position[]): Promise<RiskyPosition[]> {
    // Step 2: Batch healthFactor calls to get raw health factor data
    const healthFactorData = await this.morphoRouterIntegration.batchHealthFactors(positions);

    // Step 3: Process results, calculate health factors, and filter risky positions
    const riskyPositions: RiskyPosition[] = [];

    for (const data of healthFactorData) {
      // Calculate health factor: maxBorrow / borrowed
      let healthFactor: number;
      if (data.borrowed.isZero()) {
        healthFactor = Number.MAX_SAFE_INTEGER; // No debt = healthy
      } else {
        healthFactor = data.maxBorrow.mul(1e18).div(data.borrowed).toNumber() / 1e18;
      }

      // Only include risky positions (healthFactor < 1)
      if (healthFactor < 1) {
        riskyPositions.push({
          account: data.account,
          vault: data.vault,
          borrowed: data.borrowed,
          collateralShares: data.collateralShares,
          maxBorrow: data.maxBorrow,
          healthFactor,
        });
      }
    }

    // Log metrics
    await this.logger.logMetrics(positions.length, riskyPositions.length, this.env.NETWORK);

    return riskyPositions;
  }

  async enrichPositionData(positions: RiskyPosition[]): Promise<EnrichedPosition[]> {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized. Call run() or initializeVaultRegistry() first.');
    }

    // Step 6: Batch additional blockchain calls for position information
    
    // Get total vault shares for each position
    const totalVaultSharesArray = await this.morphoRouterIntegration.batchCollateralBalances(positions);
    
    // Get withdraw request status for each position (now with vault config)
    const withdrawRequestStatuses = await getWithdrawRequestData(
      positions, 
      this.provider, 
      this.vaultRegistry
    );
    
    // Combine all data into enriched positions
    return positions.map((position, index) => {
      const isWithdrawRequestPending = withdrawRequestStatuses[index].isWithdrawRequestPending;
      const totalVaultShares = totalVaultSharesArray[index];
      const vaultConfig = this.vaultRegistry.getVaultConfig(position.vault);
      
      // Calculate totalYieldTokens based on withdraw request status
      let totalYieldTokens: ethers.BigNumber;
      if (isWithdrawRequestPending) {
        totalYieldTokens = ethers.BigNumber.from(0);
      } else {
        // totalYieldTokens = totalVaultShares * vaultConfig.shareToYieldTokenExchangeRate
        totalYieldTokens = totalVaultShares.mul(vaultConfig!.shareToYieldTokenExchangeRate).div(ethers.utils.parseUnits('1', 24));
      }
      
      return {
        ...position,
        totalVaultShares,
        totalYieldTokens,
        isWithdrawRequestPending,
        canWithdrawRequestFinalize: withdrawRequestStatuses[index].canWithdrawRequestFinalize,
        primaryWithdrawTokenAmount: withdrawRequestStatuses[index].primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount: withdrawRequestStatuses[index].secondaryWithdrawTokenAmount,
      };
    });
  }

  filterPositionsForLiquidation(enrichedPositions: EnrichedPosition[]): EnrichedPosition[] {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized. Call run() or initializeVaultRegistry() first.');
    }

    const positionsToLiquidate: EnrichedPosition[] = [];

    for (const position of enrichedPositions) {
      const vaultConfig = this.vaultRegistry.getVaultConfig(position.vault);
      
      if (!vaultConfig) {
        console.warn(`Vault config not found for vault: ${position.vault}, skipping liquidation check`);
        continue;
      }

      // Check liquidation criteria
      if (!position.isWithdrawRequestPending && vaultConfig.liquidateYieldTokens === true) {
        // No withdraw request pending and vault allows yield token liquidation
        positionsToLiquidate.push(position);
      } else if (position.isWithdrawRequestPending && position.canWithdrawRequestFinalize) {
        // Withdraw request is pending and can be finalized
        positionsToLiquidate.push(position);
      }
    }

    return positionsToLiquidate;
  }

  private sortPositionsForLiquidation(
    positions: EnrichedPosition[]
  ): Map<string, {
    withoutWithdrawRequest: EnrichedPosition[];
    withWithdrawRequest: EnrichedPosition[];
  }> {
    const sortedByVault = new Map<string, { withoutWithdrawRequest: EnrichedPosition[], withWithdrawRequest: EnrichedPosition[] }>();

    // Group positions by vault
    for (const position of positions) {
      if (!sortedByVault.has(position.vault)) {
        sortedByVault.set(position.vault, {
          withoutWithdrawRequest: [],
          withWithdrawRequest: []
        });
      }

      const vaultPositions = sortedByVault.get(position.vault)!;
      
      if (position.isWithdrawRequestPending) {
        vaultPositions.withWithdrawRequest.push(position);
      } else {
        vaultPositions.withoutWithdrawRequest.push(position);
      }
    }

    return sortedByVault;
  }

  private batchPositionsForLiquidation(
    sortedPositions: Map<string, { withoutWithdrawRequest: EnrichedPosition[], withWithdrawRequest: EnrichedPosition[] }>
  ): Map<string, { withoutWithdrawRequest: EnrichedPosition[][], withWithdrawRequest: EnrichedPosition[] }> {
    const batchedAndSortedPositions = new Map<string, { withoutWithdrawRequest: EnrichedPosition[][], withWithdrawRequest: EnrichedPosition[] }>();
    
    for (const [vaultAddress, vaultPositions] of sortedPositions) {
      // Batch the withoutWithdrawRequest positions
      const batchedWithoutWithdrawRequest = this.batchPositions(vaultPositions.withoutWithdrawRequest, 5);
      
      // Keep withWithdrawRequest positions as-is (unbatched)
      batchedAndSortedPositions.set(vaultAddress, {
        withoutWithdrawRequest: batchedWithoutWithdrawRequest,
        withWithdrawRequest: vaultPositions.withWithdrawRequest
      });
    }
    
    return batchedAndSortedPositions;
  }

  private batchPositions<T>(positions: T[], batchSize: number = 5): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < positions.length; i += batchSize) {
      batches.push(positions.slice(i, i + batchSize));
    }
    
    return batches;
  }


  private async generateLiquidationCallData(positions: EnrichedPosition[], tokenPrices: Map<string, TokenPrice>): Promise<{ vaultAddress: string; liquidateAccounts: string[]; sharesToLiquidate: string[]; assetsToBorrow: string; redeemData: string }> {
    if (positions.length === 0) {
      throw new Error('No positions provided for liquidation');
    }

    // All positions in a batch should be from the same vault
    const vaultAddress = positions[0].vault;
    const liquidateAccounts = positions.map(p => p.account);
    const sharesToLiquidate = positions.map(p => p.collateralShares.toString());
    
    // Calculate total assets to borrow (sum of all borrowed amounts + 10% buffer)
    const totalBorrowed = positions.reduce((sum, position) => {
      return sum.add(position.borrowed);
    }, ethers.BigNumber.from(0));
    
    // Add 10% buffer to total borrowed amount
    const totalBorrowedWithBuffer = totalBorrowed.mul(110).div(100);
    
    const assetsToBorrow = totalBorrowedWithBuffer.toString();
    
    // Get vault config to determine redeem data
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized');
    }
    
    const vaultConfig = this.vaultRegistry.getVaultConfig(vaultAddress);
    if (!vaultConfig) {
      throw new Error(`Vault config not found for vault: ${vaultAddress}`);
    }
    
    // Generate appropriate redeem data based on vault type and withdraw request status
    const redeemData = await generateRedeemData(vaultConfig, positions[0], tokenPrices, this.network);
    
    return {
      vaultAddress,
      liquidateAccounts,
      sharesToLiquidate,
      assetsToBorrow,
      redeemData
    };
  }

  private async executeFlashLiquidation(liquidationParams: { vaultAddress: string; liquidateAccounts: string[]; sharesToLiquidate: string[]; assetsToBorrow: string; redeemData: string }): Promise<void> {
    try {
      console.log(`Executing flash liquidation for vault: ${liquidationParams.vaultAddress} with ${liquidationParams.liquidateAccounts.length} accounts`);
      
      // Call the flash liquidator contract
      const tx = await this.flashLiquidator.flashLiquidate(
        liquidationParams.vaultAddress,
        liquidationParams.liquidateAccounts,
        liquidationParams.sharesToLiquidate,
        liquidationParams.assetsToBorrow,
        liquidationParams.redeemData
      );
      
      console.log(`Flash liquidation transaction sent: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`Flash liquidation confirmed in block: ${receipt.blockNumber}`);
      
    } catch (error) {
      console.error('Flash liquidation failed:', error);
      throw error;
    }
  }

  async liquidatePositions(positionsToLiquidate: EnrichedPosition[]): Promise<void> {
    // Step 1: Fetch token prices
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized');
    }
    
    const tokenPrices = await getTokenPrices(
      positionsToLiquidate,
      this.vaultRegistry,
      this.provider,
      this.tradingModule,
      this.network
    );

    // Step 2: Sort positions by vault and withdraw request status
    const sortedPositions = this.sortPositionsForLiquidation(positionsToLiquidate);

    // Step 3: Process each vault
    for (const [vaultAddress, vaultPositions] of sortedPositions) {
      console.log(`Processing liquidations for vault: ${vaultAddress}`);

      // Step 3: Liquidate positions without withdraw requests (in batches)
      const batchesWithoutWithdrawRequest = this.batchPositions(vaultPositions.withoutWithdrawRequest, 5);
      
      for (const batch of batchesWithoutWithdrawRequest) {
        console.log(`Liquidating batch of ${batch.length} positions without withdraw requests`);
        const liquidationParams = await this.generateLiquidationCallData(batch, tokenPrices);
        await this.executeFlashLiquidation(liquidationParams);
      }

      // Step 4: Liquidate positions with withdraw requests (one by one)
      for (const position of vaultPositions.withWithdrawRequest) {
        console.log(`Liquidating position with withdraw request: ${position.account}`);
        const liquidationParams = await this.generateLiquidationCallData([position], tokenPrices);
        await this.executeFlashLiquidation(liquidationParams);
      }

      console.log(`Completed liquidations for vault: ${vaultAddress}`);
    }

    console.log(`Completed liquidation of ${positionsToLiquidate.length} positions across ${sortedPositions.size} vaults`);
  }

  async run(): Promise<EnrichedPosition[]> {
    // Step 1: Fetch positions from data service
    const positions = await this.fetchPositions();
    
    // Step 2: Initialize vault registry with unique vault addresses
    await this.initializeVaultRegistry(positions);
    
    // Step 3: Get risky positions
    const riskyPositions = await this.getRiskyPositions(positions);
    
    // Step 4: Enrich position data
    const enrichedPositions = await this.enrichPositionData(riskyPositions);

    // Step 5: Filter positions for liquidation
    const positionsToLiquidate = this.filterPositionsForLiquidation(enrichedPositions);

    // Step 6: Sort positions for liquidation
    const sortedPositions = this.sortPositionsForLiquidation(positionsToLiquidate);

    // Step 7: Batch positions for liquidation
    const batchedAndSortedPositions = this.batchPositionsForLiquidation(sortedPositions);

    // Step 7: Liquidate positions
    await this.liquidatePositions(positionsToLiquidate);
    
    // Step 5: Log risky position events for monitoring
    await this.logger.logRiskyPositionEvents(riskyPositions, this.env.NETWORK);

    return enrichedPositions;
  }

}