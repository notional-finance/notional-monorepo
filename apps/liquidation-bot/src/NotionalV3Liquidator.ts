import { AggregateCall, aggregate } from '@notional-finance/multicall';
import { FlashLiquidatorABI, NotionalV3ABI } from '@notional-finance/contracts';
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
import FlashLoanProvider from './lenders/FlashLender';
import { Logger } from '@notional-finance/durable-objects';
import {
  Network,
  getExcludedSources,
  getFlashLender,
  getNowSeconds,
  sendTxThroughRelayer,
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
  tokens: Map<string, string>;
  zeroExUrl: string;
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
    return this.settings.tokens.get('WETH');
  }

  private toExternal(input: any, externalPrecision: BigNumber) {
    return input
      .mul(externalPrecision)
      .div(NotionalV3Liquidator.INTERNAL_PRECISION);
  }

  private getAccountDataCalls(addrs: string[]): AggregateCall[] {
    const calls = [];
    addrs.forEach((addr) => {
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

  public async getRiskyAccounts(addrs: string[]): Promise<RiskyAccount[]> {
    const { results } = await aggregate(
      this.getAccountDataCalls(addrs),
      this.provider
    );

    const accounts = addrs
      .map((addr) => {
        return {
          id: addr,
          ethFreeCollateral: results[`${addr}:collateral`][0],
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
      const balances = results[`${a.id}:account`][1].filter((b) => b[0] !== 0);
      const portfolio = results[`${a.id}:account`][2];

      balances.forEach((b, i) => {
        const currencyId = b[0] as number;
        netUnderlyingAvailable.set(
          currencyId,
          results[`${a.id}:collateral`][1][i]
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
    zeroExUrl: string,
    from: string,
    to: string,
    amount: BigNumber,
    exactIn: boolean,
    excludedSources: string | undefined
  ): Promise<any> {
    if (!from || !to) {
      throw Error('Invalid from/to');
    }

    const queryParams = new URLSearchParams({
      sellToken: from,
      buyToken: to,
    });

    // Set excluded sources in some cases to avoid re-entrancy issues inside the flash loan
    if (excludedSources) {
      queryParams.set('excludedSources', excludedSources);
    }

    if (exactIn) {
      queryParams.set('sellAmount', amount.toString());
    } else {
      queryParams.set('buyAmount', amount.toString());
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

    const data = await resp.json();

    return data;
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
      l.flashLoanAmount =
        borrowAssetOverride.basePrecision &&
        borrowAssetOverride.overridePrecision
          ? l.flashLoanAmount
              .mul(borrowAssetOverride.overridePrecision)
              .div(borrowAssetOverride.basePrecision)
          : l.flashLoanAmount;

      flashBorrowAsset = borrowAssetOverride.flashBorrowAsset;
    }

    let preLiquidationTrade: TradeData = null;
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
        this.settings.zeroExUrl,
        flashBorrowAsset,
        l.liquidation.getLocalUnderlyingAddress(),
        l.flashLoanAmount,
        true,
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
          deadline: BigNumber.from(getNowSeconds()),
          exchangeData: zeroExResp.data,
        },
        dexId: DexId.ZERO_EX,
        useDynamicSlippage: false,
        dynamicSlippageLimit: BigNumber.from(0),
      };
    }

    let collateralTrade: TradeData = null;
    if (hasCollateral) {
      const zeroExResp = await this.getZeroExData(
        this.settings.zeroExUrl,
        l.liquidation.getCollateralUnderlyingAddress(),
        flashBorrowAsset,
        l.flashLoanAmount,
        false,
        excludedSources
      );

      collateralTrade = {
        trade: {
          tradeType: TradeType.EXACT_OUT_SINGLE,
          sellToken: l.liquidation.getCollateralUnderlyingAddress(),
          buyToken: flashBorrowAsset,
          amount: l.flashLoanAmount,
          limit: BigNumber.from(zeroExResp.sellAmount)
            .mul(this.settings.exactOutSlippageLimit)
            .div(1000),
          deadline: BigNumber.from(getNowSeconds()),
          exchangeData: zeroExResp.data,
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

  public async getLargestLiquidation(
    acct: RiskyAccount
  ): Promise<FlashLiquidation> {
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

          if (
            acct.data.portfolio.find(
              (a) => a.currencyId === currencyId && getNowSeconds() < a.maturity
            )
          ) {
            // The account has fCash collateral and therefore fCash liquidation is possible, this
            // will simply swap fCash for cash. fCash is most likely positive, collateral asset but it
            // is possible tha fCash is negative. In that case, the account will receive both cash and
            // negative fcash debt.
            const asset = acct.data.portfolio
              // Sort descending so we get the largest value
              .sort((a, b) => (a.notional.lt(b.notional) ? 1 : -1))
              .find(
                (a) =>
                  a.currencyId === currencyId && getNowSeconds() < a.maturity
              );

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

        return {
          accountId: acct.id,
          liquidation: l,
          flashLoanAmount: loanAmount
            .mul(this.settings.flashLoanBuffer)
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
        console.error(`Error: failed to get flash liquidation for
Account: ${a.accountId}
Liquidation Type: ${a.liquidation.getLiquidationType()}
Local Currency: ${a.liquidation.getLocalCurrency().id}
Collateral Currency: ${a.liquidation.getCollateralCurrencyId()}
Flash Loan Amount: ${a.flashLoanAmount.toString()}
`);
      }
    }
  }

  public async liquidateAccount(flashLiq: FlashLiquidation) {
    const { data, to } = await this.flashLoanProvider.encodeTransaction(
      flashLiq
    );
    const gasLimit = await this.flashLoanProvider.estimateGas(flashLiq);

    try {
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

Error: ${e.toString()}
`,
      });
    }
  }
}
