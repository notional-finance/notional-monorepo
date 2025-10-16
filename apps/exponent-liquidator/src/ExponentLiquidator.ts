import { ethers, Contract } from 'ethers';
import { Logger, DDSeries, MetricType, getNowSeconds, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { RiskyPosition, EnrichedPosition, Env, MetricNames, Position, HealthFactorData, VaultConfig, VaultType, TokenPrice } from './types';
import { fetchPositions } from './utils/dataService';
import { MorphoRouterIntegration } from './utils/morphoRouter';
import { batchWithdrawRequestStatus } from './utils/withdrawRequestData';
import { VaultRegistry } from './utils/vaultRegistry';

const FLASH_LIQUIDATOR_ABI = [
  'function flashLiquidate(address vaultAddress, address[] memory liquidateAccounts, uint256[] memory sharesToLiquidate, uint256 assetsToBorrow, bytes memory redeemData) external'
];

const TRADING_MODULE_ABI = [
  'function getOraclePrice(address tokenAddress, address quoteTokenAddress) external view returns (int256 price, int256 decimals)'
];

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export default class ExponentLiquidator {
  private provider: ethers.providers.Provider;
  private morphoRouterIntegration: MorphoRouterIntegration;
  private logger: Logger;
  private vaultRegistry?: VaultRegistry;
  private flashLiquidator: Contract;
  private tradingModule: Contract;

  constructor(private env: Env) {
    this.provider = getProviderFromNetwork(env.NETWORK, true);
    this.morphoRouterIntegration = new MorphoRouterIntegration(
      this.provider,
      env.MORPHO_LENDING_ROUTER_ADDRESS
    );
    this.logger = new Logger({
      apiKey: env.DD_API_KEY,
      version: '1',
      env: env.NETWORK,
      service: 'exponent-liquidator',
    });
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
    await this.logMetrics(positions.length, riskyPositions.length);

    return riskyPositions;
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

  private sortPositionsForLiquidation(positions: EnrichedPosition[]): Map<string, { withoutWithdrawRequest: EnrichedPosition[], withWithdrawRequest: EnrichedPosition[] }> {
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

  private batchPositions<T>(positions: T[], batchSize: number = 5): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < positions.length; i += batchSize) {
      batches.push(positions.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private getRequiredTokensForPricing(riskyPositions: RiskyPosition[]): Set<string> {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized');
    }

    const requiredTokens = new Set<string>();
    
    // Get unique vaults from risky positions
    const uniqueVaults = [...new Set(riskyPositions.map(p => p.vault))];
    
    for (const vaultAddress of uniqueVaults) {
      const vaultConfig = this.vaultRegistry.getVaultConfig(vaultAddress);
      if (!vaultConfig) {
        console.warn(`Vault config not found for vault: ${vaultAddress}`);
        continue;
      }

      // Add common tokens for all vault types
      requiredTokens.add(vaultConfig.asset);
      requiredTokens.add(vaultConfig.yieldToken);
      requiredTokens.add(vaultConfig.primaryWithdrawToken);

      // Add vault-type specific tokens
      switch (vaultConfig.vaultType) {
        case VaultType.Staking:
          // For staking vaults: asset, yieldToken, primaryWithdrawToken (already added above)
          break;
          
        case VaultType.PendlePT:
          // For PT vaults: asset, yieldToken, tokenOutSy, primaryWithdrawToken
          if (vaultConfig.tokenOutSy) {
            requiredTokens.add(vaultConfig.tokenOutSy);
          }
          break;
          
        case VaultType.CurveConvex2Token:
          // For CurveConvex2Token vaults: asset, token0, token1, primaryWithdrawToken, secondaryWithdrawToken
          if (vaultConfig.token0) {
            requiredTokens.add(vaultConfig.token0);
          }
          if (vaultConfig.token1) {
            requiredTokens.add(vaultConfig.token1);
          }
          if (vaultConfig.secondaryWithdrawToken) {
            requiredTokens.add(vaultConfig.secondaryWithdrawToken);
          }
          break;
      }
    }

    return requiredTokens;
  }

  private async batchFetchTokenPrices(tokens: Set<string>): Promise<Map<string, TokenPrice>> {
    const tokenArray = Array.from(tokens);
    console.log(`Fetching prices and decimals for ${tokenArray.length} tokens:`, tokenArray);
    
    // Build multicall calls for both prices and decimals
    const calls: AggregateCall[] = [];
    
    // Add price calls
    tokenArray.forEach((token, index) => {
      calls.push({
        stage: 0,
        target: this.tradingModule,
        method: 'getOraclePrice',
        args: [token, USDC_ADDRESS],
        key: `price_${index}`
      });
    });
    
    // Add decimals calls
    tokenArray.forEach((token, index) => {
      calls.push({
        stage: 0,
        target: new ethers.Contract(token, ['function decimals() external view returns (uint256)'], this.provider),
        method: 'decimals',
        args: [],
        key: `decimals_${index}`
      });
    });
    
    try {
      // Execute batch fetch for prices and decimals
      const { results } = await aggregate(calls, this.provider);
      
      const priceMap = new Map<string, TokenPrice>();
      
      for (let i = 0; i < tokenArray.length; i++) {
        const token = tokenArray[i];
        const priceData = results[`price_${i}`] as [ethers.BigNumber];
        const decimalsData = results[`decimals_${i}`] as [ethers.BigNumber];
        
        if (priceData && decimalsData) {
          const price = priceData[0];
          const decimals = decimalsData[0].toNumber();
          
          priceMap.set(token, {
            token,
            price: price,
            decimals: decimals
          });
          
          console.log(`Token ${token}: price=${price.toString()}, decimals=${decimals}`);
        }
      }
      
      return priceMap;
    } catch (error) {
      console.error('Error fetching token prices and decimals:', error);
      throw new Error(`Failed to fetch token prices and decimals: ${error}`);
    }
  }

  private generateRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
    const { vaultType } = vaultConfig;
    
    if (position.isWithdrawRequestPending) {
      // For positions with withdraw requests pending
      switch (vaultType) {
        case VaultType.Staking:
          return this.generateStakingRedeemData(vaultConfig, position, tokenPrices);
        
        case VaultType.PendlePT:
          return this.generatePendlePTRedeemData(vaultConfig, position, tokenPrices);
        
        case VaultType.CurveConvex2Token:
          return this.generateCurveConvex2TokenRedeemData(vaultConfig, position, tokenPrices);
        
        default:
          throw new Error(`Unsupported vault type for withdraw requests: ${vaultType}`);
      }
    } else {
      // For positions without withdraw requests
      switch (vaultType) {
        case VaultType.Staking:
          return this.generateStakingRedeemData(vaultConfig, position, tokenPrices);
        
        case VaultType.PendlePT:
          return this.generatePendlePTRedeemData(vaultConfig, position, tokenPrices);
        
        case VaultType.CurveConvex2Token:
          return this.generateCurveConvex2TokenRedeemData(vaultConfig, position, tokenPrices);
        
        default:
          throw new Error(`Unsupported vault type for direct liquidation: ${vaultType}`);
      }
    }
  }

  private generateStakingRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
    // Get dexId from vault config
    const dexId = vaultConfig.dexId;
    if (dexId === undefined) {
      throw new Error(`DexId not found for vault: ${vaultConfig.address}`);
    }
    
    // Get exchangeData based on withdraw request status
    const exchangeData = position.isWithdrawRequestPending 
      ? vaultConfig.withdrawExchangeData 
      : vaultConfig.redeemExchangeData;
    
    if (!exchangeData) {
      throw new Error(`Exchange data not found for vault: ${vaultConfig.address}, isWithdrawRequest: ${position.isWithdrawRequestPending}`);
    }
    
    // Calculate minPurchaseAmount
    let minPurchaseAmount: ethers.BigNumber;
    
    if (!position.isWithdrawRequestPending) {
      // Get required token prices and decimals
      const yieldTokenPrice = tokenPrices.get(vaultConfig.yieldToken);
      const assetPrice = tokenPrices.get(vaultConfig.asset);
      
      if (!yieldTokenPrice || !assetPrice) {
        throw new Error(`Token prices not found for vault: ${vaultConfig.address}`);
      }
      
      // pairPrice = yieldTokenPrice * assetPrice / 1e18
      const pairPrice = yieldTokenPrice.price.mul(assetPrice.price).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountYieldTokenPrecision = totalYieldTokenAmount * pairPrice / 1e18
      const assetAmountYieldTokenPrecision = position.totalYieldTokens.mul(pairPrice).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountNativePrecision = assetAmountYieldTokenPrecision * 1e(assetDecimals) / 1e(yieldTokenDecimals)
      const assetAmountNativePrecision = assetAmountYieldTokenPrecision
        .mul(ethers.utils.parseUnits('1', assetPrice.decimals))
        .div(ethers.utils.parseUnits('1', yieldTokenPrice.decimals));
      
      // minPurchaseAmount = assetAmountNativePrecision * (1 - vaultConfig.slippageLimit)
      const slippageMultiplier = ethers.utils.parseUnits('1', 18).sub(
        ethers.utils.parseUnits((vaultConfig.slippageLimit || 0).toString(), 18)
      );
      minPurchaseAmount = assetAmountNativePrecision.mul(slippageMultiplier).div(ethers.utils.parseUnits('1', 18));
      
    } else {
      // Get required token prices and decimals
      const primaryWithdrawTokenPrice = tokenPrices.get(vaultConfig.primaryWithdrawToken);
      const assetPrice = tokenPrices.get(vaultConfig.asset);
      
      if (!primaryWithdrawTokenPrice || !assetPrice || !position.primaryWithdrawTokenAmount) {
        throw new Error(`Token prices or withdraw amount not found for vault: ${vaultConfig.address}`);
      }
      
      // pairPrice = primaryWithdrawTokenPrice * assetPrice / 1e18
      const pairPrice = primaryWithdrawTokenPrice.price.mul(assetPrice.price).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountWithdrawTokenPrecision = primaryWithdrawTokenAmount * pairPrice / 1e18
      const assetAmountWithdrawTokenPrecision = position.primaryWithdrawTokenAmount.mul(pairPrice).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountNativePrecision = assetAmountWithdrawTokenPrecision * 1e(assetDecimals) / 1e(withdrawTokenDecimals)
      const assetAmountNativePrecision = assetAmountWithdrawTokenPrecision
        .mul(ethers.utils.parseUnits('1', assetPrice.decimals))
        .div(ethers.utils.parseUnits('1', primaryWithdrawTokenPrice.decimals));
      
      // minPurchaseAmount = assetAmountNativePrecision * (1 - vaultConfig.slippageLimit)
      const slippageMultiplier = ethers.utils.parseUnits('1', 18).sub(
        ethers.utils.parseUnits((vaultConfig.slippageLimit || 0).toString(), 18)
      );
      minPurchaseAmount = assetAmountNativePrecision.mul(slippageMultiplier).div(ethers.utils.parseUnits('1', 18));
    }
    
    // Encode RedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint8', 'uint256', 'bytes'],
      [dexId, minPurchaseAmount, exchangeData]
    );
    
    return redeemParams;
  }

  private generatePendlePTRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
    // Get dexId from vault config
    const dexId = vaultConfig.dexId;
    if (dexId === undefined) {
      throw new Error(`DexId not found for vault: ${vaultConfig.address}`);
    }
    
    // Calculate minPurchaseAmount using the same logic as Staking
    let minPurchaseAmount: ethers.BigNumber;
    
    if (!position.isWithdrawRequestPending) {
      // Get exchangeData from redeemExchangeData
      const exchangeData = vaultConfig.redeemExchangeData;
      if (!exchangeData) {
        throw new Error(`Redeem exchange data not found for vault: ${vaultConfig.address}`);
      }
      
      // Get required token prices and decimals - sell token is yieldToken
      const yieldTokenPrice = tokenPrices.get(vaultConfig.yieldToken);
      const assetPrice = tokenPrices.get(vaultConfig.asset);
      
      if (!yieldTokenPrice || !assetPrice) {
        throw new Error(`Token prices not found for vault: ${vaultConfig.address}`);
      }
      
      // Calculate minPurchaseAmount same as Staking
      // pairPrice = yieldTokenPrice * assetPrice / 1e18
      const pairPrice = yieldTokenPrice.price.mul(assetPrice.price).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountYieldTokenPrecision = totalYieldTokenAmount * pairPrice / 1e18
      const assetAmountYieldTokenPrecision = position.totalYieldTokens.mul(pairPrice).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountNativePrecision = assetAmountYieldTokenPrecision * 1e(assetDecimals) / 1e(yieldTokenDecimals)
      const assetAmountNativePrecision = assetAmountYieldTokenPrecision
        .mul(ethers.utils.parseUnits('1', assetPrice.decimals))
        .div(ethers.utils.parseUnits('1', yieldTokenPrice.decimals));
      
      // minPurchaseAmount = assetAmountNativePrecision * (1 - vaultConfig.slippageLimit)
      const slippageMultiplier = ethers.utils.parseUnits('1', 18).sub(
        ethers.utils.parseUnits((vaultConfig.slippageLimit || 0).toString(), 18)
      );
      minPurchaseAmount = assetAmountNativePrecision.mul(slippageMultiplier).div(ethers.utils.parseUnits('1', 18));
      
      // Encode PendleRedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes limitOrderData)
      const limitOrderData = '0x'; // Always empty bytes
      const redeemParams = ethers.utils.defaultAbiCoder.encode(
        ['uint8', 'uint256', 'bytes', 'bytes'],
        [dexId, minPurchaseAmount, exchangeData, limitOrderData]
      );
      
      return redeemParams;
      
    } else {
      // Get exchangeData from withdrawExchangeData
      const exchangeData = vaultConfig.withdrawExchangeData;
      if (!exchangeData) {
        throw new Error(`Withdraw exchange data not found for vault: ${vaultConfig.address}`);
      }
      
      // Get required token prices and decimals - sell token is primaryWithdrawToken
      const primaryWithdrawTokenPrice = tokenPrices.get(vaultConfig.primaryWithdrawToken);
      const assetPrice = tokenPrices.get(vaultConfig.asset);
      
      if (!primaryWithdrawTokenPrice || !assetPrice || !position.primaryWithdrawTokenAmount) {
        throw new Error(`Token prices or withdraw amount not found for vault: ${vaultConfig.address}`);
      }
      
      // Calculate minPurchaseAmount same as Staking withdraw request case
      // pairPrice = primaryWithdrawTokenPrice * assetPrice / 1e18
      const pairPrice = primaryWithdrawTokenPrice.price.mul(assetPrice.price).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountWithdrawTokenPrecision = primaryWithdrawTokenAmount * pairPrice / 1e18
      const assetAmountWithdrawTokenPrecision = position.primaryWithdrawTokenAmount.mul(pairPrice).div(ethers.utils.parseUnits('1', 18));
      
      // assetAmountNativePrecision = assetAmountWithdrawTokenPrecision * 1e(assetDecimals) / 1e(withdrawTokenDecimals)
      const assetAmountNativePrecision = assetAmountWithdrawTokenPrecision
        .mul(ethers.utils.parseUnits('1', assetPrice.decimals))
        .div(ethers.utils.parseUnits('1', primaryWithdrawTokenPrice.decimals));
      
      // minPurchaseAmount = assetAmountNativePrecision * (1 - vaultConfig.slippageLimit)
      const slippageMultiplier = ethers.utils.parseUnits('1', 18).sub(
        ethers.utils.parseUnits((vaultConfig.slippageLimit || 0).toString(), 18)
      );
      minPurchaseAmount = assetAmountNativePrecision.mul(slippageMultiplier).div(ethers.utils.parseUnits('1', 18));
      
      // Encode RedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)
      const redeemParams = ethers.utils.defaultAbiCoder.encode(
        ['uint8', 'uint256', 'bytes'],
        [dexId, minPurchaseAmount, exchangeData]
      );
      
      return redeemParams;
    }
  }

  private generateCurveConvex2TokenRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
    // TradeType enum values
    const TradeType = {
      EXACT_IN_SINGLE: 1,
      EXACT_OUT_SINGLE: 2,
      EXACT_IN_BATCH: 4,
      EXACT_OUT_BATCH: 8
    };

    if (!position.isWithdrawRequestPending) {
      // For direct liquidation: empty redemptionTrades array
      const minAmounts: ethers.BigNumber[] = []; // TODO: Calculate minAmounts
      const redemptionTrades: any[] = []; // Empty array as specified
      
      // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
      const redeemParams = ethers.utils.defaultAbiCoder.encode(
        ['uint256[]', 'tuple(uint256,uint16,uint8,uint256,bytes)[]'],
        [minAmounts, redemptionTrades]
      );
      
      return redeemParams;
      
    } else {
      // For withdraw requests: need to implement redemptionTrades logic
      const minAmounts: ethers.BigNumber[] = []; // TODO: Calculate minAmounts
      const redemptionTrades: any[] = []; // TODO: Implement redemptionTrades logic
      
      // TradeParams struct: (uint256 tradeAmount, uint16 dexId, uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData)
      // TODO: Populate redemptionTrades based on withdraw request logic
      
      // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
      const redeemParams = ethers.utils.defaultAbiCoder.encode(
        ['uint256[]', 'tuple(uint256,uint16,uint8,uint256,bytes)[]'],
        [minAmounts, redemptionTrades]
      );
      
      return redeemParams;
    }
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
    const redeemData = this.generateRedeemData(vaultConfig, positions[0], tokenPrices);
    
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
    // Step 1: Determine required tokens and fetch prices
    const requiredTokens = this.getRequiredTokensForPricing(positionsToLiquidate);
    const tokenPrices = await this.batchFetchTokenPrices(requiredTokens);
    
    console.log(`Fetched prices for ${tokenPrices.size} tokens`);

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
    
    // Step 5: Log risky position events for monitoring
    await this.logRiskyPositionEvents(riskyPositions);

    return enrichedPositions;
  }

  async enrichPositionData(positions: RiskyPosition[]): Promise<EnrichedPosition[]> {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized. Call run() or initializeVaultRegistry() first.');
    }

    // Step 6: Batch additional blockchain calls for position information
    
    // Get total vault shares for each position
    const totalVaultSharesArray = await this.morphoRouterIntegration.batchCollateralBalances(positions);
    
    // Get withdraw request status for each position (now with vault config)
    const withdrawRequestStatuses = await batchWithdrawRequestStatus(
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

  private async logMetrics(totalPositions: number, riskyPositionCount: number): Promise<void> {
    const ddSeries: DDSeries = {
      series: [
        {
          metric: MetricNames.NUM_RISKY_ACCOUNTS,
          points: [
            {
              value: riskyPositionCount,
              timestamp: getNowSeconds(),
            },
          ],
          type: MetricType.Gauge,
          tags: [`network:${this.env.NETWORK}`],
        },
        {
          metric: MetricNames.TOTAL_ACCOUNTS_PROCESSED,
          points: [
            {
              value: totalPositions,
              timestamp: getNowSeconds(),
            },
          ],
          type: MetricType.Gauge,
          tags: [`network:${this.env.NETWORK}`],
        },
      ],
    };

    await this.logger.submitMetrics(ddSeries);
  }

  async logRiskyPositionEvents(positions: RiskyPosition[]): Promise<void> {
    for (const position of positions) {
      await this.logger.submitEvent({
        aggregation_key: 'RiskyPosition',
        alert_type: 'info',
        host: 'cloudflare',
        network: this.env.NETWORK,
        title: `Risky Position Detected: ${position.account} in Vault: ${position.vault}`,
        tags: [`event:risky_position_detected`, `account:${position.account}`],
        text: `
account: ${position.account}
vault: ${position.vault}
healthFactor: ${position.healthFactor}
borrowed: ${position.borrowed.toString()}
collateralShares: ${position.collateralShares.toString()}
maxBorrow: ${position.maxBorrow.toString()}
        `,
      });
    }
  }
}