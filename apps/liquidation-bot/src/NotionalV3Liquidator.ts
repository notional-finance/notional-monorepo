import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  FlashLiquidatorABI,
  IAggregator,
  IAggregatorABI,
  NotionalV3,
  NotionalV3ABI,
} from '@notional-finance/contracts';
import { ethers, BigNumber, Contract } from 'ethers';
import {
  RiskyAccount,
  CurrencyOverride,
  FlashLiquidation,
  IFlashLoanProvider,
  Currency,
  LiquidationType,
  AccountLiquidation,
  TradeData,
  TradeType,
  DexId,
} from './types';
import FlashLoanProvider from './FlashLender';
import { Logger } from '@notional-finance/durable-objects';
import {
  Network,
  WETHAddress,
  getExcludedSources,
  getFlashLender,
  getNowSeconds,
  sendTxThroughRelayer,
  zeroExUrl,
  NetworkId,
} from '@notional-finance/util';
import Liquidation from './liquidation';

export type LiquidatorSettings = {
  network: Network;
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  notionalAddress: string;
  dustThreshold: BigNumber;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
  currencies: Currency[];
  zeroExApiKey: string;
  overrides: CurrencyOverride[];
  exactInSlippageLimit: BigNumber; // Precision = 1000
  exactOutSlippageLimit: BigNumber; // Precision = 1000
  gasCostBuffer: BigNumber; // Precision = 1000
  profitThreshold: BigNumber;
};

export default class NotionalV3Liquidator {
  public static readonly INTERNAL_PRECISION = ethers.utils.parseUnits('1', 8);
  public static readonly ETH_PRECISION = ethers.utils.parseEther('1');

  private liquidatorContract: Contract;
  private notionalContract: Contract;
  private flashLoanProvider: IFlashLoanProvider;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings,
    private logger: Logger
  ) {
    this.liquidatorContract = new ethers.Contract(
      this.settings.flashLiquidatorAddress,
      FlashLiquidatorABI,
      this.provider
    );
    this.notionalContract = new ethers.Contract(
      this.settings.notionalAddress,
      NotionalV3ABI,
      this.provider
    );
    this.flashLoanProvider = new FlashLoanProvider(
      settings.network,
      settings.flashLiquidatorAddress,
      this.provider
    );
  }

  private getCurrencyById(currencyId: number): Currency {
    const currency = this.settings.currencies.find((c) => c.id === currencyId);
    if (!currency) {
      throw Error('Invalid currency');
    }
    return currency;
  }

  get wethAddress(): string {
    return WETHAddress[this.settings.network];
  }

  private toExternal(input: BigNumber, externalPrecision: BigNumber) {
    return input
      .mul(externalPrecision)
      .div(NotionalV3Liquidator.INTERNAL_PRECISION);
  }

  private getAccountDataCalls(addresses: string[]): AggregateCall[] {
    const calls: AggregateCall[] = [];
    addresses.forEach((addr) => {
      calls.push({
        stage: 0,
        target: this.liquidatorContract,
        method: 'getFreeCollateral',
        args: [addr],
        key: `${addr}:collateral`,
      });

      calls.push({
        stage: 0,
        target: this.notionalContract,
        method: 'getAccount',
        args: [addr],
        key: `${addr}:account`,
      });
    });

    return calls;
  }

  public async getAccountData(address: string) {
    const { results } = await aggregate(
      this.getAccountDataCalls([address]),
      this.provider
    );

    return results;
  }

  public async getRiskyAccounts(addresses: string[]): Promise<RiskyAccount[]> {
    const { results } = await aggregate(
      this.getAccountDataCalls(addresses),
      this.provider,
      undefined,
      true
    );

    const failedAccounts = addresses.filter(
      (a) =>
        results[`${a}:collateral`] === undefined ||
        results[`${a}:account`] === undefined
    );
    for (const a of failedAccounts) {
      await this.logger.submitEvent({
        aggregation_key: 'AccountRiskFailure',
        alert_type: 'error',
        host: 'cloudflare',
        network: this.settings.network,
        title: `Failed Account Free Collateral`,
        tags: [`account:${a}`, `event:failed_account_health`],
        text: `Failed to get account free collateral: ${a}`,
      });
    }

    const accounts = addresses
      // Filter out accounts that failed their health check
      .filter((a) => !failedAccounts.includes(a))
      .map((id) => {
        return {
          id,
          ethFreeCollateral: (results[`${id}:collateral`] as BigNumber[])[0],
        };
      })
      .filter(
        (a) =>
          a.ethFreeCollateral.isNegative() &&
          this.toExternal(
            a.ethFreeCollateral.abs(),
            NotionalV3Liquidator.ETH_PRECISION
          ).gte(this.settings.dustThreshold)
      );

    return accounts.map((a) => {
      const netUnderlyingAvailable = new Map<number, BigNumber>();
      const accountData = results[`${a.id}:account`] as Awaited<
        ReturnType<NotionalV3['getAccount']>
      >;
      const balances = accountData.accountBalances.filter((b) => b[0] !== 0);
      const portfolio = accountData.portfolio;

      balances.forEach((b, i) => {
        const currencyId = b[0] as number;
        netUnderlyingAvailable.set(
          currencyId,
          (
            results[`${a.id}:collateral`] as Awaited<
              ReturnType<NotionalV3['getFreeCollateral']>
            >
          )[1][i]
        );
      });

      return {
        id: a.id,
        ethFreeCollateral: a.ethFreeCollateral,
        data: {
          balances: balances.map((b) => ({
            currencyId: b[0] as number,
            cashBalance: b[1] as BigNumber,
            nTokenBalance: b[2] as BigNumber,
          })),
          portfolio: portfolio.map((v) => ({
            currencyId: v[0] as number,
            maturity: v[1].toNumber(),
            notional: v[3],
          })),
        },
        netUnderlyingAvailable: netUnderlyingAvailable,
      };
    });
  }

  private async getZeroExData(
    from: string,
    to: string,
    amount: BigNumber,
    excludedSources: string | undefined
  ): Promise<{
    blockNumber: string;
    buyAmount: string;
    buyToken: string;
    fees: {
      integratorFee: null;
      zeroExFee: {
        amount: string;
        token: string;
        type: string;
      };
      gasFee: null;
    };
    issues: {
      allowance: null;
      balance: {
        token: string;
        actual: string;
        expected: string;
      };
      simulationIncomplete: boolean;
      invalidSourcesPassed: any[];
    };
    liquidityAvailable: boolean;
    minBuyAmount: string;
    route: {
      fills: Array<{
        from: string;
        to: string;
        source: string;
        proportionBps: string;
      }>;
      tokens: Array<{
        address: string;
        symbol: string;
      }>;
    };
    sellAmount: string;
    sellToken: string;
    totalNetworkFee: string;
    transaction: {
      to: string;
      data: string;
      gas: string;
      gasPrice: string;
      value: string;
    };
    zid: string;
  }> {
    if (!from || !to) {
      throw Error('Invalid from/to');
    }

    const queryParams = new URLSearchParams({
      sellToken: from,
      buyToken: to,
      taker: this.settings.flashLiquidatorAddress,
      sellAmount: amount.toString(),
      chainId: String(NetworkId[this.settings.network]),
    });

    // Set excluded sources in some cases to avoid re-entrancy issues inside the flash loan
    if (excludedSources) {
      queryParams.set('excludedSources', excludedSources);
    }

    const fetchUrl = zeroExUrl + '?' + queryParams;
    const resp = await fetch(fetchUrl, {
      headers: {
        '0x-api-key': this.settings.zeroExApiKey,
      },
    });

    // Wait 1 sec between estimations because of rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (resp.status !== 200) {
      throw Error(`Bad 0x response:  ${await resp.text()}`);
    }

    return await resp.json();
  }

  private async convertFlashBorrowAmount(
    originalFlashBorrowAmount: BigNumber,
    borrowAssetOverride: CurrencyOverride
  ) {
    const oracle = new Contract(
      borrowAssetOverride.oracle,
      IAggregatorABI,
      this.provider
    ) as IAggregator;

    const decimals = await oracle.decimals();
    const rate = await oracle.latestAnswer();
    return (
      originalFlashBorrowAmount
        .mul(borrowAssetOverride.overridePrecision)
        .mul(rate)
        // Apply the buffer again to allow for any slippage during trading
        .mul(this.settings.flashLoanBuffer)
        .div(borrowAssetOverride.basePrecision)
        .div(BigNumber.from(10).pow(decimals))
        // This is for the flash loan buffer
        .div(1000)
    );
  }

  public async getFlashLiquidation(
    l: AccountLiquidation
  ): Promise<FlashLiquidation> {
    const hasCollateral =
      l.liquidation.getLiquidationType() ===
        LiquidationType.COLLATERAL_CURRENCY ||
      l.liquidation.getLiquidationType() ===
        LiquidationType.CROSS_CURRENCY_FCASH;

    let flashBorrowAsset = l.liquidation.getLocalUnderlyingAddress();
    const borrowAssetOverride = this.settings.overrides.find(
      (c) => c.id === l.liquidation.getLocalCurrency().id
    );

    if (borrowAssetOverride) {
      // If overriding the flash borrow asset, need to convert to the override
      // denomination at the oracle rate here.
      l.flashLoanAmount = await this.convertFlashBorrowAmount(
        l.flashLoanAmount,
        borrowAssetOverride
      );
      flashBorrowAsset = borrowAssetOverride.flashBorrowAsset;
    }

    let preLiquidationTrade: TradeData | null = null;
    const flashLender = getFlashLender({
      network: this.settings.network,
      token: flashBorrowAsset,
    });
    const excludedSources = getExcludedSources(
      this.settings.network,
      flashLender
    );

    if (flashBorrowAsset !== l.liquidation.getLocalUnderlyingAddress()) {
      // Sell flash borrowed asset for local currency
      const zeroExResp = await this.getZeroExData(
        flashBorrowAsset,
        l.liquidation.getLocalUnderlyingAddress(),
        l.flashLoanAmount,
        excludedSources
      );
      preLiquidationTrade = {
        trade: {
          tradeType: TradeType.EXACT_IN_SINGLE,
          sellToken: flashBorrowAsset,
          buyToken: l.liquidation.getLocalUnderlyingAddress(),
          amount: l.flashLoanAmount,
          limit: BigNumber.from(zeroExResp.buyAmount)
            .mul(this.settings.exactInSlippageLimit)
            .div(1000),
          deadline: BigNumber.from(getNowSeconds() + 1000),
          exchangeData: zeroExResp.transaction.data,
        },
        dexId: DexId.ZERO_EX,
        useDynamicSlippage: false,
        dynamicSlippageLimit: BigNumber.from(0),
      };
    }

    let collateralTrade: TradeData | null = null;
    if (
      hasCollateral &&
      l.collateralReceivedAmount &&
      // There are times when flash borrowing ETH and doing a pre-liquidation trade, we will not
      // have to do a collateral trade.
      l.liquidation.getCollateralUnderlyingAddress().toLowerCase() !==
        flashBorrowAsset.toLowerCase()
    ) {
      const zeroExResp = await this.getZeroExData(
        l.liquidation.getCollateralUnderlyingAddress(),
        flashBorrowAsset,
        l.collateralReceivedAmount,
        excludedSources
      );

      collateralTrade = {
        trade: {
          tradeType: TradeType.EXACT_IN_SINGLE,
          sellToken: l.liquidation.getCollateralUnderlyingAddress(),
          buyToken: flashBorrowAsset,
          amount: l.collateralReceivedAmount,
          limit: BigNumber.from(zeroExResp.buyAmount)
            .mul(this.settings.exactInSlippageLimit)
            .div(1000),
          deadline: BigNumber.from(getNowSeconds() + 1000),
          exchangeData: zeroExResp.transaction.data,
        },
        dexId: DexId.ZERO_EX,
        useDynamicSlippage: false,
        dynamicSlippageLimit: BigNumber.from(0),
      };
    }

    return {
      accountLiq: l,
      flashBorrowAsset: flashBorrowAsset,
      preLiquidationTrade: preLiquidationTrade,
      collateralTrade: collateralTrade,
    };
  }

  public async getLargestLiquidation(acct: RiskyAccount) {
    const netUnderlying = Array.from(acct.netUnderlyingAvailable.entries());
    const netDebt = netUnderlying.filter(([_, n]) => n.isNegative());

    const possibleLiquidations = netUnderlying.flatMap(
      ([currencyId, netLocal]) => {
        const liquidations: Liquidation[] = [];

        if (!netLocal.isZero()) {
          if (
            acct.data.balances.find(
              (a) => a.currencyId === currencyId && !a.nTokenBalance.isZero()
            )
          ) {
            // The account has nTokens and therefore nToken liquidation is possible, this
            // will simply swap nTokens for cash
            liquidations.push(
              new Liquidation(
                LiquidationType.LOCAL_CURRENCY,
                this.getCurrencyById(currencyId),
                null,
                null,
                this.wethAddress
              )
            );
          }

          const fCashAssets = acct.data.portfolio.filter(
            (a) => a.currencyId === currencyId && getNowSeconds() < a.maturity
          );
          if (fCashAssets.length) {
            // The account has fCash collateral and therefore fCash liquidation is possible, this
            // will simply swap fCash for cash. fCash is most likely positive, collateral asset but it
            // is possible tha fCash is negative. In that case, the account will receive both cash and
            // negative fcash debt.
            const [asset, _] = fCashAssets
              // Sort descending so we get the largest value
              .sort((a, b) => (b.notional.lt(a.notional) ? 1 : -1));

            // Only liquidate one fCash asset at a time, this is just simpler to reason
            // about. The largest (most positive) fCash asset will be liquidated first.
            liquidations.push(
              new Liquidation(
                LiquidationType.LOCAL_FCASH,
                this.getCurrencyById(currencyId),
                null,
                [asset.maturity],
                this.wethAddress
              )
            );
          }
        }

        // NOTE: in some cases you will have to force a different collateral currency
        // than the one that is returned by the logic below.
        if (netLocal.gt(0)) {
          // Collateral liquidations are possible, check each combination of collateral and debt currency
          liquidations.push(
            ...netDebt.map(
              ([debtId, _]) =>
                new Liquidation(
                  LiquidationType.COLLATERAL_CURRENCY,
                  this.getCurrencyById(debtId),
                  this.getCurrencyById(currencyId),
                  null,
                  this.wethAddress
                )
            )
          );
        }

        return liquidations;
      }
    );

    // Execute simulated liquidation calls against all the possible combinations
    const calls = possibleLiquidations.flatMap((l) =>
      l.getFlashLoanAmountCall(this.notionalContract, acct.id)
    );
    const { results } = await aggregate(calls, this.provider, undefined, true);

    // Merge the results back with the possible liquidation object
    const accountLiquidations = possibleLiquidations
      .map((l) => {
        const loanAmount = results[
          `${acct.id}:${l.getLiquidationType()}:${
            l.getLocalCurrency().id
          }:${l.getCollateralCurrencyId()}:loanAmount`
        ] as BigNumber;

        let collateralReceivedAmount: BigNumber | undefined = undefined;
        if (l.getLiquidationType() === LiquidationType.COLLATERAL_CURRENCY) {
          collateralReceivedAmount = results[
            `${acct.id}:${l.getLiquidationType()}:${
              l.getLocalCurrency().id
            }:${l.getCollateralCurrencyId()}:collateralReceivedAmount`
          ] as BigNumber;
        }

        return {
          accountId: acct.id,
          liquidation: l,
          flashLoanAmount: loanAmount
            .mul(this.settings.flashLoanBuffer)
            .div(1000),
          // De-rate the collateral received amount just a bit
          collateralReceivedAmount: collateralReceivedAmount
            ?.mul(995)
            .div(1000),
        };
      })
      .filter((l) => !l.flashLoanAmount.isZero())
      // Find the liquidation with the largest flash loan amount. This will serve as a heuristic
      // for the most profitable liquidation
      .sort((a, b) => (a.flashLoanAmount.lt(b.flashLoanAmount) ? 1 : -1));

    for (const a of accountLiquidations) {
      try {
        // This will get all the flash liquidation parameters
        return await this.getFlashLiquidation(a);
      } catch (e) {
        // If this fails then will proceed to the next one
        await this.logger.submitEvent({
          aggregation_key: 'AccountLiquidated',
          alert_type: 'error',
          host: 'cloudflare',
          network: this.settings.network,
          title: `Failed Account Liquidation`,
          tags: [`account:${a.accountId}`, `event:failed_account_liquidated`],
          text: `
        Account: ${a.accountId}
        Liquidation Type: ${a.liquidation.getLiquidationType()}
        Local Currency: ${a.liquidation.getLocalCurrency().id}
        Collateral Currency: ${a.liquidation.getCollateralCurrencyId()}
        Flash Loan Amount: ${a.flashLoanAmount.toString()}

        Error: ${(e as Error).toString()}
        `,
        });
      }
    }

    return undefined;
  }

  public async liquidateAccount(flashLiq: FlashLiquidation) {
    try {
      const { data, to } = await this.flashLoanProvider.encodeTransaction(
        flashLiq
      );
      const gasLimit = await this.flashLoanProvider.estimateGas(flashLiq);

      const txnResponse = await sendTxThroughRelayer({
        env: {
          NETWORK: this.settings.network,
          TX_RELAY_AUTH_TOKEN: this.settings.txRelayAuthToken,
        },
        to,
        data,
        gasLimit: gasLimit.mul(200).div(100).toNumber(),
      });

      await this.logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'info',
        host: 'cloudflare',
        network: this.settings.network,
        title: `Account liquidated`,
        tags: [
          `account:${flashLiq.accountLiq.accountId}`,
          `event:account_liquidated`,
        ],
        text: `Liquidated account ${flashLiq.accountLiq.accountId}, ${txnResponse.hash}`,
      });
    } catch (e) {
      await this.logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'error',
        host: 'cloudflare',
        network: this.settings.network,
        title: `Failed Account Liquidation`,
        tags: [
          `account:${flashLiq.accountLiq.accountId}`,
          `event:failed_account_liquidated`,
        ],
        text: `
Failed to liquidate account: ${flashLiq.accountLiq.accountId}
Flash Borrow Asset: ${flashLiq.flashBorrowAsset.toString()}
Liquidation Type: ${flashLiq.accountLiq.liquidation.getLiquidationType()}
Local Currency: ${flashLiq.accountLiq.liquidation.getLocalCurrency().id}
Collateral Currency: ${flashLiq.accountLiq.liquidation.getCollateralCurrencyId()}
Flash Loan Amount: ${flashLiq.accountLiq.flashLoanAmount.toString()}

Error: ${(e as Error).toString()}
`,
      });
    }
  }
}
