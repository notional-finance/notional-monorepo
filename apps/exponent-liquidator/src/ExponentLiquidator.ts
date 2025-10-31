import { ethers, PopulatedTransaction } from 'ethers';
import {
  Network,
  sendTxThroughRelayer,
} from '@notional-finance/util';
import {
  RiskyPosition,
  EnrichedPosition,
  Env,
  Position,
  TokenPrice,
  VaultType,
  TransactionResult,
  LiquidationReport,
  LiquidationRunResult,
} from './types';
import { MorphoRouterIntegration } from './utils/morphoRouter';
import { getWithdrawRequestData } from './utils/withdrawRequestData';
import { VaultRegistry } from './utils/vaultRegistry';
import {
  ExponentFlashLiquidatorV2,
  ExponentFlashLiquidatorV2ABI,
  TradingModule,
  TradingModuleABI,
} from '@notional-finance/contracts';
import { generateRedeemData } from './utils/redeemDataGenerator';
import { getTokenPrices } from './utils/tokenPricing';
import { LiquidatorLogger } from './utils/logging';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { VAULT_ABI } from './abis';

// Math constants for liquidation calculations
const ORACLE_PRICE_SCALE = ethers.utils.parseUnits('1', 36);

const wMulDown = (x: ethers.BigNumber, y: ethers.BigNumber): ethers.BigNumber => {
  const WAD = ethers.utils.parseUnits('1', 18);
  return x.mul(y).div(WAD);
};

const mulDivDown = (x: ethers.BigNumber, y: ethers.BigNumber, d: ethers.BigNumber): ethers.BigNumber => {
  return x.mul(y).div(d);
};

export default class ExponentLiquidator {
  private provider: ethers.providers.Provider;
  private morphoRouterIntegration: MorphoRouterIntegration;
  private logger: LiquidatorLogger;
  private vaultRegistry: VaultRegistry;
  private positions: Position[];
  private flashLiquidator: ExponentFlashLiquidatorV2;
  private tradingModule: TradingModule;
  private network: Network;
  private environment: 'development' | 'production';

  constructor(
    private env: Env,
    positions: Position[],
    vaultRegistry: VaultRegistry,
    provider: ethers.providers.Provider,
    environment: 'development' | 'production' = 'production'
  ) {
    this.network = env.NETWORK;
    this.provider = provider;
    this.positions = positions;
    this.vaultRegistry = vaultRegistry;
    this.environment = environment;
    this.morphoRouterIntegration = new MorphoRouterIntegration(
      this.provider,
      env.MORPHO_LENDING_ROUTER_ADDRESS
    );
    this.logger = new LiquidatorLogger(env);
    this.flashLiquidator = new ethers.Contract(
      env.FLASH_LIQUIDATOR_ADDRESS,
      ExponentFlashLiquidatorV2ABI,
      this.provider
    ) as ExponentFlashLiquidatorV2;
    this.tradingModule = new ethers.Contract(
      env.TRADING_MODULE_ADDRESS,
      TradingModuleABI,
      this.provider
    ) as TradingModule;
  }

  async getRiskyPositions(): Promise<RiskyPosition[]> {
    // Step 1: Batch healthFactor calls to get raw health factor data
    const healthFactorData =
      await this.morphoRouterIntegration.batchHealthFactors(this.positions);

    // Step 2: Batch borrowShares calls to get borrow share data
    const borrowSharesData =
      await this.morphoRouterIntegration.batchBorrowShareBalances(this.positions);

    // Step 3: Process results, calculate health factors, and filter risky positions
    const riskyPositions: RiskyPosition[] = [];
    console.log('🏗️  Risky positions:', riskyPositions.length);

    for (let i = 0; i < healthFactorData.length; i++) {
      const data = healthFactorData[i];
      const borrowShares = borrowSharesData[i];
      
      // Calculate health factor: maxBorrow / borrowed
      console.log('🏗️  Health factor data:', data);
      let healthFactor: number;
      if (data.borrowed.isZero()) {
        healthFactor = Number.MAX_SAFE_INTEGER; // No debt = healthy
      } else {
        healthFactor =
          data.maxBorrow.mul(ethers.utils.parseUnits('1', 18)).div(data.borrowed).div(ethers.utils.parseUnits('1', 18)).toNumber();
      }
      console.log('🏗️  Health factor:', healthFactor);
      // Only include risky positions (healthFactor < 1)
      if (healthFactor < 1) {
        riskyPositions.push({
          account: data.account,
          vault: data.vault,
          borrowed: data.borrowed,
          maxBorrow: data.maxBorrow,
          healthFactor,
          borrowShares,
        });
      }
    }

    return riskyPositions;
  }

  async enrichPositionData(
    positions: RiskyPosition[]
  ): Promise<EnrichedPosition[]> {
    // Step 2: Batch additional blockchain calls for position information

    // Get total vault shares for each position
    const totalVaultSharesArray =
      await this.morphoRouterIntegration.batchCollateralBalances(positions);

    // Get account vault share prices for each position
    const vaultInterface = new ethers.utils.Interface(VAULT_ABI);
    const accountVaultSharePriceCalls: AggregateCall[] = positions.map((position, index) => ({
      stage: 0,
      target: new ethers.Contract(position.vault, vaultInterface, this.provider),
      method: 'price',
      args: [position.account],
      key: `accountVaultSharePrice_${index}`,
    }));

    console.log('🏗️  Account vault share price calls:', accountVaultSharePriceCalls.length);
    const { results: accountVaultSharePriceResults } = await aggregate(accountVaultSharePriceCalls, this.provider);
    console.log('🏗️  Account vault share price results:', accountVaultSharePriceResults);

    const accountVaultSharePricesArray = positions.map((_, index) => 
      accountVaultSharePriceResults[`accountVaultSharePrice_${index}`] as ethers.BigNumber
    );

    // Get withdraw request status for each position (now with vault config)
    const withdrawRequestStatuses = await getWithdrawRequestData(
      positions,
      this.provider,
      this.vaultRegistry
    );

    // Combine all data into enriched positions
    return positions.map((position, index) => {
      const isWithdrawRequestPending =
        withdrawRequestStatuses[index].isWithdrawRequestPending;
      const collateralShares = totalVaultSharesArray[index];
      const accountVaultSharePrice = accountVaultSharePricesArray[index];

      return {
        ...position,
        collateralShares,
        isWithdrawRequestPending,
        canWithdrawRequestFinalize:
          withdrawRequestStatuses[index].canWithdrawRequestFinalize,
        primaryWithdrawTokenAmount:
          withdrawRequestStatuses[index].primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount:
          withdrawRequestStatuses[index].secondaryWithdrawTokenAmount,
        accountVaultSharePrice,
      };
    });
  }

  private calculateLiquidationAmounts(
    positions: EnrichedPosition[],
    liquidationIncentiveFactor: ethers.BigNumber
  ): { 
    collateralSharesToSeize: ethers.BigNumber[]; 
    isMaxLiquidate: boolean[];
    totalCollateralSharesSeized: ethers.BigNumber;
  } {
    let totalCollateralSharesSeized = ethers.BigNumber.from(0);
    
    const results = positions.map(position => {
      const theoreticalSeizableCollateralQuotedInAsset = wMulDown(
        position.borrowed,
        liquidationIncentiveFactor
      );

      const theoreticalSeizableCollateralShares = mulDivDown(
        theoreticalSeizableCollateralQuotedInAsset,
        ORACLE_PRICE_SCALE,
        position.accountVaultSharePrice
      );

      console.log('🏗️  Theoretical seizable collateral quoted in asset:', theoreticalSeizableCollateralQuotedInAsset.toString());
      console.log('🏗️  Theoretical seizable collateral shares:', theoreticalSeizableCollateralShares.toString());
      console.log('🏗️  Collateral shares:', position.collateralShares.toString());
      console.log('🏗️  Borrowed:', position.borrowed.toString());
      console.log('🏗️  Borrow shares:', position.borrowShares.toString());
      console.log('🏗️  Account vault share price:', position.accountVaultSharePrice.toString());

      if (position.collateralShares.lt(theoreticalSeizableCollateralShares)) {
        totalCollateralSharesSeized = totalCollateralSharesSeized.add(position.collateralShares);
        return {
          collateralSharesToSeize: position.collateralShares,
          isMaxLiquidate: false
        };
      } else {
        totalCollateralSharesSeized = totalCollateralSharesSeized.add(theoreticalSeizableCollateralShares);
        return {
          collateralSharesToSeize: theoreticalSeizableCollateralShares,
          isMaxLiquidate: true
        };
      }
    });

    return {
      collateralSharesToSeize: results.map(r => r.collateralSharesToSeize),
      isMaxLiquidate: results.map(r => r.isMaxLiquidate),
      totalCollateralSharesSeized
    };
  }

  filterPositionsForLiquidation(
    enrichedPositions: EnrichedPosition[]
  ): EnrichedPosition[] {
    const positionsToLiquidate: EnrichedPosition[] = [];

    for (const position of enrichedPositions) {
      const vaultConfig = this.vaultRegistry.getVaultConfig(position.vault);

      if (!vaultConfig) {
        console.warn(
          `Vault config not found for vault: ${position.vault}, skipping liquidation check`
        );
        continue;
      }

      // Check liquidation criteria
      if (
        !position.isWithdrawRequestPending &&
        vaultConfig.liquidateYieldTokens === true
      ) {
        // No withdraw request pending and vault allows yield token liquidation
        positionsToLiquidate.push(position);
      } else if (
        position.isWithdrawRequestPending &&
        position.canWithdrawRequestFinalize
      ) {
        // Withdraw request is pending and can be finalized
        positionsToLiquidate.push(position);
      }
    }

    return positionsToLiquidate;
  }

  private sortPositionsForLiquidation(positions: EnrichedPosition[]): Map<
    string,
    {
      withoutWithdrawRequest: EnrichedPosition[];
      withWithdrawRequest: EnrichedPosition[];
    }
  > {
    const sortedByVault = new Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[];
        withWithdrawRequest: EnrichedPosition[];
      }
    >();

    // Group positions by vault
    for (const position of positions) {
      if (!sortedByVault.has(position.vault)) {
        sortedByVault.set(position.vault, {
          withoutWithdrawRequest: [],
          withWithdrawRequest: [],
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
    sortedPositions: Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[];
        withWithdrawRequest: EnrichedPosition[];
      }
    >
  ): Map<
    string,
    {
      withoutWithdrawRequest: EnrichedPosition[][];
      withWithdrawRequest: EnrichedPosition[];
    }
  > {
    const batchedAndSortedPositions = new Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[][];
        withWithdrawRequest: EnrichedPosition[];
      }
    >();

    for (const [vaultAddress, vaultPositions] of sortedPositions) {
      // Batch the withoutWithdrawRequest positions
      const batchedWithoutWithdrawRequest = this.batchPositions(
        vaultPositions.withoutWithdrawRequest,
        5
      );

      // Keep withWithdrawRequest positions as-is (not batched)
      batchedAndSortedPositions.set(vaultAddress, {
        withoutWithdrawRequest: batchedWithoutWithdrawRequest,
        withWithdrawRequest: vaultPositions.withWithdrawRequest,
      });
    }

    return batchedAndSortedPositions;
  }

  private batchPositions<T>(positions: T[], batchSize = 5): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < positions.length; i += batchSize) {
      batches.push(positions.slice(i, i + batchSize));
    }

    return batches;
  }

  private async generateLiquidationCallData(
    batchedAndSortedPositions: Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[][];
        withWithdrawRequest: EnrichedPosition[];
      }
    >,
    tokenPrices: Map<string, TokenPrice>
  ): Promise<
    {
      vaultAddress: string;
      liquidateAccounts: string[];
      collateralSharesToSeize: ethers.BigNumber[];
      isMaxLiquidate: boolean[];
      assetsToBorrow: ethers.BigNumber;
      redeemData: string;
      totalCollateralSharesSeized: ethers.BigNumber;
    }[]
  > {
    const liquidationParams: {
      vaultAddress: string;
      liquidateAccounts: string[];
      collateralSharesToSeize: ethers.BigNumber[];
      isMaxLiquidate: boolean[];
      assetsToBorrow: ethers.BigNumber;
      redeemData: string;
      totalCollateralSharesSeized: ethers.BigNumber;
    }[] = [];

    // Iterate through each vault
    for (const [, vaultPositions] of batchedAndSortedPositions) {
      // Process isWithdrawRequestPending False batches first
      for (const batch of vaultPositions.withoutWithdrawRequest) {
        const liquidationData = await this.generateSingleLiquidationCallData(
          batch,
          false,
          tokenPrices
        );
        liquidationParams.push(liquidationData);
      }

      // Then process isWithdrawRequestPending True positions one by one
      for (const position of vaultPositions.withWithdrawRequest) {
        const liquidationData = await this.generateSingleLiquidationCallData(
          [position],
          true,
          tokenPrices
        );
        liquidationParams.push(liquidationData);
      }
    }

    return liquidationParams;
  }

  private async generateSingleLiquidationCallData(
    positions: EnrichedPosition[],
    isWithdrawRequestPending: boolean,
    tokenPrices: Map<string, TokenPrice>
  ): Promise<{
    vaultAddress: string;
    liquidateAccounts: string[];
    collateralSharesToSeize: ethers.BigNumber[];
    isMaxLiquidate: boolean[];
    assetsToBorrow: ethers.BigNumber;
    redeemData: string;
    totalCollateralSharesSeized: ethers.BigNumber;
  }> {
    if (positions.length === 0) {
      throw new Error('No positions provided for liquidation');
    }

    // All positions in a batch should be from the same vault
    const vaultAddress = positions[0].vault;
    const liquidateAccounts = positions.map((p) => p.account);

    // Get vault config to get liquidation incentive factor
    const vaultConfig = this.vaultRegistry.getVaultConfig(vaultAddress);
    if (!vaultConfig) {
      throw new Error(`Vault config not found for vault: ${vaultAddress}`);
    }

    // Calculate collateralSharesToSeize and borrowSharesToRepay for each position
    const liquidationResults = this.calculateLiquidationAmounts(positions, vaultConfig.liquidationIncentiveFactor);
    const collateralSharesToSeize = liquidationResults.collateralSharesToSeize;
    const isMaxLiquidate = liquidationResults.isMaxLiquidate;
    const totalCollateralSharesSeized = liquidationResults.totalCollateralSharesSeized;

    // Calculate total assets to borrow (sum of all borrowed amounts + 10% buffer)
    const totalBorrowed = positions.reduce((sum, position) => {
      return sum.add(position.borrowed);
    }, ethers.BigNumber.from(0));

    // Add 10% buffer to total borrowed amount
    const totalBorrowedWithBuffer = totalBorrowed.mul(110).div(100);

    const assetsToBorrow = totalBorrowedWithBuffer;

    // Calculate parameters for redeem data generation based on withdraw request status
    let yieldTokenAmount: ethers.BigNumber | undefined;
    let primaryWithdrawTokenAmount: ethers.BigNumber | undefined;
    let secondaryWithdrawTokenAmount: ethers.BigNumber | undefined;

    if (!isWithdrawRequestPending) {
      // yieldTokenAmount = totalCollateralSharesSeized * vaultConfig.shareToYieldTokenExchangeRate
      yieldTokenAmount = totalCollateralSharesSeized
        .mul(vaultConfig.shareToYieldTokenExchangeRate)
        .div(ethers.utils.parseUnits('1', 24));
    } else {
      // Scale withdraw amounts by (totalCollateralSharesSeized / position.collateralShares)
      const position = positions[0];
      const scalingFactor = totalCollateralSharesSeized
        .mul(ethers.utils.parseUnits('1', 24))
        .div(position.collateralShares);

      // primaryWithdrawTokenAmount = position.primaryWithdrawTokenAmount * scalingFactor
      primaryWithdrawTokenAmount = position.primaryWithdrawTokenAmount
        ?.mul(scalingFactor)
        .div(ethers.utils.parseUnits('1', 24));

      // If vaultConfig.vaultType = CurveConvex2Token: secondaryWithdrawTokenAmount = position.secondaryWithdrawTokenAmount * scalingFactor
      if (vaultConfig.vaultType === VaultType.CurveConvex2Token) {
        secondaryWithdrawTokenAmount = position.secondaryWithdrawTokenAmount
          ?.mul(scalingFactor)
          .div(ethers.utils.parseUnits('1', 24));
      }
    }

    // Generate appropriate redeem data based on vault type and withdraw request status
    const redeemData = await generateRedeemData(
      vaultConfig,
      isWithdrawRequestPending,
      tokenPrices,
      this.network,
      yieldTokenAmount,
      primaryWithdrawTokenAmount,
      secondaryWithdrawTokenAmount
    );

    return {
      vaultAddress,
      liquidateAccounts,
      collateralSharesToSeize,
      isMaxLiquidate,
      assetsToBorrow,
      redeemData,
      totalCollateralSharesSeized,
    };
  }

  private async generateTransactions(
    liquidationParams: {
      vaultAddress: string;
      liquidateAccounts: string[];
      collateralSharesToSeize: ethers.BigNumber[];
      isMaxLiquidate: boolean[];
      assetsToBorrow: ethers.BigNumber;
      redeemData: string;
      totalCollateralSharesSeized: ethers.BigNumber;
    }[]
  ): Promise<PopulatedTransaction[]> {
    const populatedTxs: PopulatedTransaction[] = [];

    for (const params of liquidationParams) {
      const populatedTx =
        await this.flashLiquidator.populateTransaction.flashLiquidate(
          params.vaultAddress,
          params.liquidateAccounts,
          params.collateralSharesToSeize,
          params.isMaxLiquidate,
          params.assetsToBorrow,
          params.redeemData
        );
      populatedTxs.push(populatedTx);
    }

    return populatedTxs;
  }

  private async pruneFailingTransactions(
    populatedTxs: PopulatedTransaction[]
  ): Promise<PopulatedTransaction[]> {
    const failingTxns: PopulatedTransaction[] = [];

    const batch = (
      await Promise.all(
        populatedTxs.map((tx) =>
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
      .filter(
        (tx) => !failingTxns.find((failingTx) => failingTx.data === tx?.data)
      );

    return batch.filter((tx): tx is PopulatedTransaction => tx !== null);
  }

  private async executeTransactionsViaRelay(
    validTxs: PopulatedTransaction[]
  ): Promise<LiquidationReport> {
    const transactionResults: TransactionResult[] = [];

    for (const tx of validTxs) {
      try {
        console.log(`Executing transaction to: ${tx.to}`);

        const gasLimit = await this.provider.estimateGas(tx);

        let resp: ethers.providers.TransactionResponse | undefined = undefined;
        if (tx.data && tx.to) {
          if (this.environment === 'development') {
            // In development mode, simulate transaction execution on anvil fork
            console.log('🧪 Development mode: Simulating transaction execution');
            const simulationResult = await this.provider.call(tx);
            console.log('🔬 Simulation result:', simulationResult);
            
            // Create a mock transaction response
            resp = {
              hash: `0x${'dev'.padEnd(64, '0')}`,
              blockNumber: 0,
              blockHash: '',
              transactionIndex: 0,
              confirmations: 1,
              from: '',
              gasPrice: ethers.BigNumber.from(0),
              gasLimit: gasLimit,
              to: tx.to,
              value: ethers.BigNumber.from(0),
              nonce: 0,
              data: tx.data,
              chainId: 1,
              wait: async () => ({} as any)
            } as ethers.providers.TransactionResponse;
          } else {
            // Production mode: Use relay
            console.log('🔧 Production mode: Sending transaction via relay');
            console.log(this.env.NETWORK)
            console.log(this.env.TX_RELAY_AUTH_TOKEN)
            console.log(tx.to as string)
            console.log(tx.data as string)
            resp = await sendTxThroughRelayer({
              env: {
                NETWORK: this.env.NETWORK,
                TX_RELAY_AUTH_TOKEN: this.env.TX_RELAY_AUTH_TOKEN,
              },
              to: tx.to as string,
              data: tx.data as string,
              gasLimit: gasLimit.mul(200).div(100).toNumber(),
            });
          }

          transactionResults.push({
            success: true,
            hash: resp?.hash,
            gasLimit: gasLimit.toNumber(),
            to: tx.to as string,
          });

          if (resp) {
            console.log(`Transaction sent via relay: ${resp.hash}`);
          }
        }
      } catch (error) {
        console.error('Transaction execution failed:', error);
        transactionResults.push({
          success: false,
          error: (error as Error).message,
          to: tx.to as string,
        });
      }
    }

    const report: LiquidationReport = {
      totalTransactions: validTxs.length,
      successfulTransactions: transactionResults.filter((r) => r.success)
        .length,
      failedTransactions: transactionResults.filter((r) => !r.success).length,
      transactionResults,
    };

    console.log(
      `Completed liquidation: ${report.successfulTransactions}/${report.totalTransactions} transactions successful`
    );

    return report;
  }

  async run(): Promise<LiquidationRunResult> {
    let riskyPositions: RiskyPosition[] = [];
    let enrichedPositions: EnrichedPosition[] = [];
    let positionsToLiquidate: EnrichedPosition[] = [];
    let liquidationReport: LiquidationReport = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      transactionResults: [],
    };

    try {
      // Step 1: Get risky positions
      riskyPositions = await this.getRiskyPositions();
      console.log('🏗️  Risky positions:', riskyPositions.length);
    } catch (error) {
      console.error('❌ Getting risky positions failed:', error);
      await this.logger.logError(
        'Getting risky positions',
        (error as Error).message,
        { type: 'positions', data: this.positions }
      );
      throw error;
    }

    try {
      // Step 2: Enrich position data
      enrichedPositions = await this.enrichPositionData(riskyPositions);
      console.log('🏗️  Enriched positions:', enrichedPositions.length);
    } catch (error) {
      console.error('❌ Enriching position data failed:', error);
      await this.logger.logError(
        'Enriching position data',
        (error as Error).message,
        { type: 'riskyPositions', data: riskyPositions }
      );
      throw error;
    }

    try {
      // Step 3: Filter positions for liquidation
      positionsToLiquidate =
        this.filterPositionsForLiquidation(enrichedPositions);
      console.log('🏗️  Positions to liquidate:', positionsToLiquidate.length);
    } catch (error) {
      console.error('❌ Filtering positions for liquidation failed:', error);
      await this.logger.logError(
        'Filtering positions for liquidation',
        (error as Error).message,
        { type: 'enrichedPositions', data: enrichedPositions }
      );
      throw error;
    }

    let sortedPositions: Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[];
        withWithdrawRequest: EnrichedPosition[];
      }
    >;
    try {
      // Step 4: Sort positions for liquidation
      sortedPositions = this.sortPositionsForLiquidation(positionsToLiquidate);
      console.log('🏗️  Sorted positions:', sortedPositions.size);
    } catch (error) {
      console.error('❌ Sorting positions for liquidation failed:', error);
      await this.logger.logError(
        'Sorting positions for liquidation',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    let batchedAndSortedPositions: Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[][];
        withWithdrawRequest: EnrichedPosition[];
      }
    >;
    try {
      // Step 5: Batch positions for liquidation
      batchedAndSortedPositions =
        this.batchPositionsForLiquidation(sortedPositions);
      console.log('🏗️  Batched and sorted positions:', batchedAndSortedPositions.size);
    } catch (error) {
      console.error('❌ Batching positions for liquidation failed:', error);
      await this.logger.logError(
        'Batching positions for liquidation',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    let tokenPrices: Map<string, TokenPrice>;
    try {
      // Step 6: Fetch token prices
      tokenPrices = await getTokenPrices(
        positionsToLiquidate,
        this.vaultRegistry,
        this.provider,
        this.tradingModule,
        this.network
      );
      console.log('🏗️  Token prices:', tokenPrices.size);
    } catch (error) {
      console.error('❌ Fetching token prices failed:', error);
      await this.logger.logError(
        'Fetching token prices',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    let liquidationParams: {
      vaultAddress: string;
      liquidateAccounts: string[];
      collateralSharesToSeize: ethers.BigNumber[];
      isMaxLiquidate: boolean[];
      assetsToBorrow: ethers.BigNumber;
      redeemData: string;
      totalCollateralSharesSeized: ethers.BigNumber;
    }[];
    try {
      // Step 7: Generate liquidation call data
      liquidationParams = await this.generateLiquidationCallData(
        batchedAndSortedPositions,
        tokenPrices
      );
      console.log('🏗️  Liquidation params:', liquidationParams.map(param => ({
        ...param,
        collateralSharesToSeize: param.collateralSharesToSeize.map(shares => shares.toString()),
        isMaxLiquidate: param.isMaxLiquidate.map(isMax => isMax.toString()),
        assetsToBorrow: param.assetsToBorrow.toString(),
        totalCollateralSharesSeized: param.totalCollateralSharesSeized.toString()
      })));
    } catch (error) {
      console.error('❌ Generating liquidation call data failed:', error);
      await this.logger.logError(
        'Generating liquidation call data',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    let populatedTxs: PopulatedTransaction[];
    try {
      // Step 8: Generate populated transactions
      populatedTxs = await this.generateTransactions(liquidationParams);
      console.log('🏗️  Populated transactions:', populatedTxs.length);
    } catch (error) {
      console.error('❌ Generating populated transactions failed:', error);
      await this.logger.logError(
        'Generating populated transactions',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    let validTxs: PopulatedTransaction[];
    try {
      // Step 9: Prune failing transactions
      validTxs = await this.pruneFailingTransactions(populatedTxs);
      console.log('🏗️  Valid transactions:', validTxs.length);
    } catch (error) {
      console.error('❌ Pruning failing transactions failed:', error);
      await this.logger.logError(
        'Pruning failing transactions',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    try {
      // Step 10: Execute the valid transactions via relay
      liquidationReport = await this.executeTransactionsViaRelay(validTxs);
      console.log('🏗️  Liquidation report:', liquidationReport);
    } catch (error) {
      console.error('❌ Executing transactions via relay failed:', error);
      await this.logger.logError(
        'Executing transactions via relay',
        (error as Error).message,
        { type: 'enrichedPositions', data: positionsToLiquidate }
      );
      throw error;
    }

    return {
      positionsToLiquidate,
      liquidationReport,
      enrichedPositions,
    };
  }
}
