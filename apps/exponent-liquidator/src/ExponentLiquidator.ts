import { ethers, Contract } from 'ethers';
import { getProviderFromNetwork, Network, sendTxThroughRelayer } from '@notional-finance/util';
import { RiskyPosition, EnrichedPosition, Env, Position, TokenPrice, VaultType } from './types';
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


  private async generateLiquidationCallData(
    batchedAndSortedPositions: Map<string, { withoutWithdrawRequest: EnrichedPosition[][], withWithdrawRequest: EnrichedPosition[] }>,
    tokenPrices: Map<string, TokenPrice>
  ): Promise<{ vaultAddress: string; liquidateAccounts: string[]; sharesToLiquidate: string[]; assetsToBorrow: string; redeemData: string; totalSharesLiquidated: ethers.BigNumber }[]> {
    const liquidationParams: { vaultAddress: string; liquidateAccounts: string[]; sharesToLiquidate: string[]; assetsToBorrow: string; redeemData: string; totalSharesLiquidated: ethers.BigNumber }[] = [];

    // Iterate through each vault
    for (const [vaultAddress, vaultPositions] of batchedAndSortedPositions) {
      // Process isWithdrawRequestPending False batches first
      for (const batch of vaultPositions.withoutWithdrawRequest) {
        const liquidationData = await this.generateSingleLiquidationCallData(batch, false, tokenPrices);
        liquidationParams.push(liquidationData);
      }

      // Then process isWithdrawRequestPending True positions one by one
      for (const position of vaultPositions.withWithdrawRequest) {
        const liquidationData = await this.generateSingleLiquidationCallData([position], true, tokenPrices);
        liquidationParams.push(liquidationData);
      }
    }

    return liquidationParams;
  }

  private async generateSingleLiquidationCallData(positions: EnrichedPosition[], isWithdrawRequestPending: boolean, tokenPrices: Map<string, TokenPrice>): Promise<{ vaultAddress: string; liquidateAccounts: string[]; sharesToLiquidate: string[]; assetsToBorrow: string; redeemData: string; totalSharesLiquidated: ethers.BigNumber }> {
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

    // Calculate total shares liquidated by summing up sharesToLiquidate for all accounts in the batch
    const totalSharesLiquidated = positions.reduce((sum, position) => {
      return sum.add(position.collateralShares);
    }, ethers.BigNumber.from(0));
    
    // Get vault config to determine redeem data
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized');
    }
    
    const vaultConfig = this.vaultRegistry.getVaultConfig(vaultAddress);
    if (!vaultConfig) {
      throw new Error(`Vault config not found for vault: ${vaultAddress}`);
    }
    
    // Calculate parameters for redeem data generation based on withdraw request status
    let yieldTokenAmount: ethers.BigNumber | undefined;
    let primaryWithdrawTokenAmount: ethers.BigNumber | undefined;
    let secondaryWithdrawTokenAmount: ethers.BigNumber | undefined;

    if (!isWithdrawRequestPending) {
      // yieldTokenAmount = totalSharesLiquidated * vaultConfig.shareToYieldTokenExchangeRate
      yieldTokenAmount = totalSharesLiquidated.mul(vaultConfig.shareToYieldTokenExchangeRate).div(ethers.utils.parseUnits('1', 24));
    } else {
      // primaryWithdrawTokenAmount = position.primaryWithdrawTokenAmount
      primaryWithdrawTokenAmount = positions[0].primaryWithdrawTokenAmount;
      
      // If vaultConfig.vaultType = CurveConvex2Token: secondaryWithdrawTokenAmount = position.secondaryWithdrawTokenAmount
      if (vaultConfig.vaultType === VaultType.CurveConvex2Token) {
        secondaryWithdrawTokenAmount = positions[0].secondaryWithdrawTokenAmount;
      }
    }
    
    // Generate appropriate redeem data based on vault type and withdraw request status
    const redeemData = await generateRedeemData(
      vaultConfig,
      isWithdrawRequestPending,
      yieldTokenAmount,
      primaryWithdrawTokenAmount,
      secondaryWithdrawTokenAmount,
      tokenPrices,
      this.network
    );
    
    return {
      vaultAddress,
      liquidateAccounts,
      sharesToLiquidate,
      assetsToBorrow,
      redeemData,
      totalSharesLiquidated
    };
  }

  private async generateTransactions(
    liquidationParams: { vaultAddress: string; liquidateAccounts: string[]; sharesToLiquidate: string[]; assetsToBorrow: string; redeemData: string; totalSharesLiquidated: ethers.BigNumber }[]
  ): Promise<ethers.UnsignedTransaction[]> {
    const unsignedTxs: ethers.UnsignedTransaction[] = [];

    for (const params of liquidationParams) {
      const unsignedTx = await this.flashLiquidator.populateTransaction.flashLiquidate(
        params.vaultAddress,
        params.liquidateAccounts,
        params.sharesToLiquidate,
        params.assetsToBorrow,
        params.redeemData
      );
      unsignedTxs.push(unsignedTx);
    }

    return unsignedTxs;
  }

  private async pruneFailingTransactions(unsignedTxs: ethers.UnsignedTransaction[]): Promise<ethers.UnsignedTransaction[]> {
    const failingTxns: ethers.UnsignedTransaction[] = [];

    const batch = (
      await Promise.all(
        unsignedTxs.map((tx) =>
          this.provider
            .estimateGas(tx)
            .catch((e) => {
              console.log('FAILED ESTIMATE GAS ', e);
              failingTxns.push(tx);
              return null;
            })
            .then(() => tx)
        )
      )
    )
      // Exclude any failing txns in here
      .filter((tx) => !failingTxns.find((failingTx) => failingTx.data === tx?.data));

    return batch.filter((tx): tx is ethers.UnsignedTransaction => tx !== null);
  }


  private async executeTransactionsViaRelay(validTxs: ethers.UnsignedTransaction[]): Promise<void> {
    for (const tx of validTxs) {
      try {
        console.log(`Executing transaction to: ${tx.to}`);
        
        const gasLimit = await this.provider.estimateGas(tx);
        
        let resp: ethers.providers.TransactionResponse | undefined = undefined;
        if (tx.data && tx.to) {
          resp = await sendTxThroughRelayer({
            env: {
              NETWORK: this.env.NETWORK,
              TX_RELAY_AUTH_TOKEN: this.env.TX_RELAY_AUTH_TOKEN,
            },
            to: tx.to,
            data: tx.data,
            gasLimit: gasLimit.mul(200).div(100).toNumber(),
          });
        }
        
        if (resp) {
          console.log(`Transaction sent via relay: ${resp.hash}`);
        }
        
      } catch (error) {
        console.error('Transaction execution failed:', error);
        throw error;
      }
    }

    console.log(`Completed liquidation of ${validTxs.length} transactions`);
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

    // Step 8: Fetch token prices
    const tokenPrices = await getTokenPrices(
      positionsToLiquidate,
      this.vaultRegistry,
      this.provider,
      this.tradingModule,
      this.network
    );

    // Step 9: Generate liquidation call data
    const liquidationParams = await this.generateLiquidationCallData(batchedAndSortedPositions, tokenPrices);

    // Step 10: Generate unsigned transactions
    const unsignedTxs = await this.generateTransactions(liquidationParams);

    // Step 11: Prune failing transactions
    const validTxs = await this.pruneFailingTransactions(unsignedTxs);

    // Step 12: Execute the valid transactions via relay
    await this.executeTransactionsViaRelay(validTxs);
    
    // Step 13: Log risky position events for monitoring
    await this.logger.logRiskyPositionEvents(riskyPositions, this.env.NETWORK);

    return enrichedPositions;
  }

}