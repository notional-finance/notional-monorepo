import { ethers, PopulatedTransaction } from 'ethers';
import { Network, sendTxThroughRelayer } from '@notional-finance/util';
import {
  RiskyPosition,
  RiskyPositionWithoutBorrowShares,
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
  YieldStrategy__factory,
} from '@notional-finance/contracts';
import { generateRedeemData } from './utils/redeemDataGenerator';
import { getTokenPrices } from './utils/tokenPricing';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { logDebug, logError } from './utils/logger';

// Math constants for liquidation calculations
const ORACLE_PRICE_SCALE = ethers.utils.parseUnits('1', 36);

const wMulDown = (
  x: ethers.BigNumber,
  y: ethers.BigNumber
): ethers.BigNumber => {
  const WAD = ethers.utils.parseUnits('1', 18);
  return x.mul(y).div(WAD);
};

const mulDivDown = (
  x: ethers.BigNumber,
  y: ethers.BigNumber,
  d: ethers.BigNumber
): ethers.BigNumber => {
  return x.mul(y).div(d);
};

export default class ExponentLiquidator {
  private provider: ethers.providers.Provider;
  private morphoRouterIntegration: MorphoRouterIntegration;
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

    const riskyPositionsData: RiskyPositionWithoutBorrowShares[] =
      healthFactorData
        .filter((data) => data.healthFactor < 1)
        .map((data) => ({
          account: data.account,
          vault: data.vault,
          borrowed: data.borrowed,
          maxBorrow: data.maxBorrow,
          healthFactor: data.healthFactor,
        }));

    const borrowSharesData =
      await this.morphoRouterIntegration.batchBorrowShareBalances(
        riskyPositionsData.map((position) => [position.account, position.vault])
      );

    const riskyPositions: RiskyPosition[] = riskyPositionsData.map(
      (position, index) => ({
        ...position,
        borrowShares: borrowSharesData[index],
      })
    );

    logDebug(
      'Risky positions identified',
      {
        riskyPositionsCount: riskyPositions.length,
      },
      this.env.LOG_LEVEL
    );
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
    const accountVaultSharePriceCalls: AggregateCall[] = positions.map(
      (position, index) => ({
        stage: 0,
        target: YieldStrategy__factory.connect(position.vault, this.provider),
        method: 'price(address)',
        args: [position.account],
        key: `accountVaultSharePrice_${index}`,
      })
    );

    logDebug(
      'Account vault share price calls',
      {
        callsCount: accountVaultSharePriceCalls.length,
      },
      this.env.LOG_LEVEL
    );
    const { results: accountVaultSharePriceResults } = await aggregate(
      accountVaultSharePriceCalls,
      this.provider
    );
    logDebug(
      'Account vault share price results received',
      {
        resultsCount: Object.keys(accountVaultSharePriceResults).length,
      },
      this.env.LOG_LEVEL
    );

    const accountVaultSharePricesArray = positions.map(
      (_, index) =>
        accountVaultSharePriceResults[
          `accountVaultSharePrice_${index}`
        ] as ethers.BigNumber
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
  ) {
    let totalCollateralSharesSeized = ethers.BigNumber.from(0);

    const results = positions.map((position) => {
      const theoreticalSeizableCollateralQuotedInAsset = wMulDown(
        position.borrowed,
        liquidationIncentiveFactor
      );

      const theoreticalSeizableCollateralShares = mulDivDown(
        theoreticalSeizableCollateralQuotedInAsset,
        ORACLE_PRICE_SCALE,
        position.accountVaultSharePrice
      );

      logDebug(
        'Liquidation calculation details',
        {
          theoreticalSeizableCollateralQuotedInAsset:
            theoreticalSeizableCollateralQuotedInAsset.toString(),
          theoreticalSeizableCollateralShares:
            theoreticalSeizableCollateralShares.toString(),
          collateralShares: position.collateralShares.toString(),
          borrowed: position.borrowed.toString(),
          borrowShares: position.borrowShares.toString(),
          accountVaultSharePrice: position.accountVaultSharePrice.toString(),
        },
        this.env.LOG_LEVEL
      );

      if (position.collateralShares.lt(theoreticalSeizableCollateralShares)) {
        totalCollateralSharesSeized = totalCollateralSharesSeized.add(
          position.collateralShares
        );
        return {
          collateralSharesToSeize: position.collateralShares,
          isMaxLiquidate: false,
        };
      } else {
        totalCollateralSharesSeized = totalCollateralSharesSeized.add(
          theoreticalSeizableCollateralShares
        );
        return {
          collateralSharesToSeize: theoreticalSeizableCollateralShares,
          isMaxLiquidate: true,
        };
      }
    });

    return {
      collateralSharesToSeize: results.map((r) => r.collateralSharesToSeize),
      isMaxLiquidate: results.map((r) => r.isMaxLiquidate),
      totalCollateralSharesSeized,
    };
  }

  filterPositionsForLiquidation(
    enrichedPositions: EnrichedPosition[]
  ): EnrichedPosition[] {
    return enrichedPositions.filter((position) => {
      const vaultConfig = this.vaultRegistry.getVaultConfig(position.vault);
      if (!vaultConfig) {
        console.warn(
          `Vault config not found for vault: ${position.vault}, skipping liquidation check`
        );
        return false;
      }

      // If autoForceWithdraw is enabled, skip normal liquidation for positions without pending withdraws
      if (vaultConfig.autoForceWithdraw && !position.isWithdrawRequestPending) {
        return false;
      }

      const canLiquidateYieldTokens =
        vaultConfig.liquidateYieldTokens === true &&
        !position.isWithdrawRequestPending;
      const canLiquidateWithdrawRequest =
        position.isWithdrawRequestPending &&
        position.canWithdrawRequestFinalize;
      return canLiquidateYieldTokens || canLiquidateWithdrawRequest;
    });
  }

  filterPositionsForForceWithdraw(
    enrichedPositions: EnrichedPosition[]
  ): EnrichedPosition[] {
    return enrichedPositions.filter((position) => {
      const vaultConfig = this.vaultRegistry.getVaultConfig(position.vault);
      if (!vaultConfig) {
        return false;
      }

      // Only force withdraw if:
      // 1. autoForceWithdraw is enabled
      // 2. No pending withdraw request
      return (
        vaultConfig.autoForceWithdraw === true &&
        !position.isWithdrawRequestPending
      );
    });
  }

  private sortPositionsForLiquidation(positions: EnrichedPosition[]) {
    return positions.reduce((sortedPositions, position) => {
      if (!sortedPositions.has(position.vault)) {
        sortedPositions.set(position.vault, {
          withoutWithdrawRequest: [],
          withWithdrawRequest: [],
        });
      }
      if (position.isWithdrawRequestPending) {
        sortedPositions.get(position.vault)!.withWithdrawRequest.push(position);
      } else {
        sortedPositions
          .get(position.vault)!
          .withoutWithdrawRequest.push(position);
      }
      return sortedPositions;
    }, new Map<string, { withoutWithdrawRequest: EnrichedPosition[]; withWithdrawRequest: EnrichedPosition[] }>());
  }

  private batchPositionsForLiquidation(
    sortedPositions: Map<
      string,
      {
        withoutWithdrawRequest: EnrichedPosition[];
        withWithdrawRequest: EnrichedPosition[];
      }
    >
  ) {
    return new Map(
      Array.from(sortedPositions, ([vaultAddress, vaultPositions]) => [
        vaultAddress,
        {
          withoutWithdrawRequest: Array.from(
            {
              length: Math.ceil(
                vaultPositions.withoutWithdrawRequest.length / 5
              ),
            },
            (_, index) =>
              vaultPositions.withoutWithdrawRequest.slice(
                index * 5,
                (index + 1) * 5
              )
          ),
          withWithdrawRequest: vaultPositions.withWithdrawRequest,
        },
      ])
    );
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
  ) {
    return Promise.all(
      Array.from(batchedAndSortedPositions).flatMap(([_, vaultPositions]) => {
        return [
          ...vaultPositions.withoutWithdrawRequest.map(async (batch) => {
            return await this.generateSingleLiquidationCallData(
              batch,
              false,
              tokenPrices
            );
          }),
          ...vaultPositions.withWithdrawRequest.map(async (position) => {
            return await this.generateSingleLiquidationCallData(
              [position],
              true,
              tokenPrices
            );
          }),
        ];
      })
    );
  }

  private async generateSingleLiquidationCallData(
    positions: EnrichedPosition[],
    isWithdrawRequestPending: boolean,
    tokenPrices: Map<string, TokenPrice>
  ) {
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
    const liquidationResults = this.calculateLiquidationAmounts(
      positions,
      vaultConfig.liquidationIncentiveFactor
    );
    const collateralSharesToSeize = liquidationResults.collateralSharesToSeize;
    const isMaxLiquidate = liquidationResults.isMaxLiquidate;
    const totalCollateralSharesSeized =
      liquidationResults.totalCollateralSharesSeized;

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
    return Promise.all(
      liquidationParams.map(async (params) => {
        const populatedTx =
          await this.flashLiquidator.populateTransaction.flashLiquidate(
            params.vaultAddress,
            params.liquidateAccounts,
            params.collateralSharesToSeize,
            params.isMaxLiquidate,
            params.assetsToBorrow,
            params.redeemData
          );
        return populatedTx;
      })
    );
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
              logDebug(
                'Failed estimate gas',
                {
                  error: (e as Error).message,
                },
                this.env.LOG_LEVEL
              );
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

  private async generateForceWithdrawTransactions(
    positions: EnrichedPosition[]
  ): Promise<PopulatedTransaction[]> {
    return Promise.all(
      positions.map(async (position) => {
        return await this.morphoRouterIntegration.forceWithdraw(
          position.account,
          position.vault
        );
      })
    );
  }

  private async executeTransactionsViaRelay(
    validTxs: PopulatedTransaction[]
  ): Promise<LiquidationReport> {
    const transactionResults: TransactionResult[] = [];

    for (const tx of validTxs) {
      try {
        logDebug(
          'Executing transaction',
          {
            to: tx.to,
          },
          this.env.LOG_LEVEL
        );

        const gasLimit = await this.provider.estimateGas(tx);

        let resp: ethers.providers.TransactionResponse | undefined = undefined;
        if (tx.data && tx.to) {
          if (this.environment === 'development') {
            // In development mode, simulate transaction execution on anvil fork
            logDebug(
              'Development mode: Simulating transaction execution',
              undefined,
              this.env.LOG_LEVEL
            );
            const simulationResult = await this.provider.call(tx);
            logDebug(
              'Simulation result received',
              {
                result: simulationResult,
              },
              this.env.LOG_LEVEL
            );

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
              wait: async () => ({} as any),
            } as ethers.providers.TransactionResponse;
          } else {
            // Production mode: Use relay
            logDebug(
              'Production mode: Sending transaction via relay',
              {
                network: this.env.NETWORK,
                to: tx.to as string,
              },
              this.env.LOG_LEVEL
            );
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
            logDebug(
              'Transaction sent via relay',
              {
                hash: resp.hash,
              },
              this.env.LOG_LEVEL
            );
          }
        }
      } catch (error) {
        logError('Transaction execution failed', error as Error, {
          to: tx.to as string,
          data: tx.data as string,
        });
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

    logDebug(
      'Completed liquidation',
      {
        successfulTransactions: report.successfulTransactions,
        totalTransactions: report.totalTransactions,
      },
      this.env.LOG_LEVEL
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
      logDebug(
        'Risky positions retrieved',
        {
          riskyPositionsCount: riskyPositions.length,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Getting risky positions', error as Error, {
        positionsCount: this.positions.length,
        network: this.network,
      });
      throw error;
    }

    try {
      // Step 2: Enrich position data
      enrichedPositions = await this.enrichPositionData(riskyPositions);
      logDebug(
        'Enriched positions',
        {
          enrichedPositionsCount: enrichedPositions.length,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Enriching position data', error as Error, {
        riskyPositions: riskyPositions,
        network: this.network,
      });
      throw error;
    }

    let positionsForForceWithdraw: EnrichedPosition[] = [];
    try {
      // Step 3: Filter positions for liquidation
      positionsToLiquidate =
        this.filterPositionsForLiquidation(enrichedPositions);
      logDebug(
        'Positions to liquidate filtered',
        {
          positionsToLiquidateCount: positionsToLiquidate.length,
        },
        this.env.LOG_LEVEL
      );

      // Step 3b: Filter positions for force withdraw
      positionsForForceWithdraw =
        this.filterPositionsForForceWithdraw(enrichedPositions);
      logDebug(
        'Positions for force withdraw filtered',
        {
          positionsForForceWithdrawCount: positionsForForceWithdraw.length,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Filtering positions for liquidation', error as Error, {
        enrichedPositions: enrichedPositions,
        network: this.network,
      });
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
      logDebug(
        'Sorted positions',
        {
          sortedPositionsCount: sortedPositions.size,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Sorting positions for liquidation', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
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
      logDebug(
        'Batched and sorted positions',
        {
          batchedPositionsCount: batchedAndSortedPositions.size,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Batching positions for liquidation', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
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
      logDebug(
        'Token prices fetched',
        {
          tokenPricesCount: tokenPrices.size,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Fetching token prices', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
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
      logDebug(
        'Liquidation params generated',
        {
          liquidationParams: liquidationParams.map((param) => ({
            ...param,
            collateralSharesToSeize: param.collateralSharesToSeize.map(
              (shares) => shares.toString()
            ),
            isMaxLiquidate: param.isMaxLiquidate.map((isMax) =>
              isMax.toString()
            ),
            assetsToBorrow: param.assetsToBorrow.toString(),
            totalCollateralSharesSeized:
              param.totalCollateralSharesSeized.toString(),
          })),
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Generating liquidation call data', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
      throw error;
    }

    let populatedTxs: PopulatedTransaction[];
    let forceWithdrawTxs: PopulatedTransaction[] = [];
    try {
      // Step 8: Generate populated transactions
      populatedTxs = await this.generateTransactions(liquidationParams);
      logDebug(
        'Populated transactions generated',
        {
          populatedTxsCount: populatedTxs.length,
        },
        this.env.LOG_LEVEL
      );

      // Step 8b: Generate force withdraw transactions
      if (positionsForForceWithdraw.length > 0) {
        forceWithdrawTxs = await this.generateForceWithdrawTransactions(
          positionsForForceWithdraw
        );
        logDebug(
          'Force withdraw transactions generated',
          {
            forceWithdrawTxsCount: forceWithdrawTxs.length,
          },
          this.env.LOG_LEVEL
        );
      }
    } catch (error) {
      logError('Generating populated transactions', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
      throw error;
    }

    let validTxs: PopulatedTransaction[];
    try {
      // Step 9: Prune failing transactions
      const allTxs = [...populatedTxs, ...forceWithdrawTxs];
      validTxs = await this.pruneFailingTransactions(allTxs);
      logDebug(
        'Valid transactions',
        {
          validTxsCount: validTxs.length,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Pruning failing transactions', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
      throw error;
    }

    try {
      // Step 10: Execute the valid transactions via relay
      liquidationReport = await this.executeTransactionsViaRelay(validTxs);
      logDebug(
        'Liquidation report',
        {
          liquidationReport,
        },
        this.env.LOG_LEVEL
      );
    } catch (error) {
      logError('Executing transactions via relay', error as Error, {
        positionsToLiquidate: positionsToLiquidate,
        network: this.network,
      });
      throw error;
    }

    return {
      positionsToLiquidate,
      liquidationReport,
      enrichedPositions,
    };
  }
}
