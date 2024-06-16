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
    exactIn: boolean
  ): Promise<any> {
    if (!from || !to) {
      throw Error('Invalid from/to');
    }

    const queryParams = new URLSearchParams({
      sellToken: from,
      buyToken: to,
    });

    // TODO: if balancer then need to exclude it as a source for the trade...
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
    accountLiq: AccountLiquidation
  ): Promise<FlashLiquidation> {
    const hasCollateral =
      accountLiq.liquidation.getLiquidationType() ===
        LiquidationType.COLLATERAL_CURRENCY ||
      accountLiq.liquidation.getLiquidationType() ===
        LiquidationType.CROSS_CURRENCY_FCASH;

    let flashBorrowAsset = accountLiq.liquidation.getLocalUnderlyingAddress();
    const borrowAssetOverride = this.settings.overrides.find(
      (c) => c.id === accountLiq.liquidation.getLocalCurrency().id
    );
    if (borrowAssetOverride) {
      flashBorrowAsset = borrowAssetOverride.flashBorrowAsset;
    }

    let preLiquidationTrade: TradeData = null;
    if (
      flashBorrowAsset !== accountLiq.liquidation.getLocalUnderlyingAddress()
    ) {
      // Sell flash borrowed asset for local currency
      const zeroExResp = await this.getZeroExData(
        this.settings.zeroExUrl,
        flashBorrowAsset,
        accountLiq.liquidation.getLocalUnderlyingAddress(),
        accountLiq.flashLoanAmount,
        true
      );
      preLiquidationTrade = {
        trade: {
          tradeType: TradeType.EXACT_IN_SINGLE,
          sellToken: flashBorrowAsset,
          buyToken: accountLiq.liquidation.getLocalUnderlyingAddress(),
          amount: accountLiq.flashLoanAmount,
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
        accountLiq.liquidation.getCollateralUnderlyingAddress(),
        flashBorrowAsset,
        accountLiq.flashLoanAmount,
        false
      );

      collateralTrade = {
        trade: {
          tradeType: TradeType.EXACT_OUT_SINGLE,
          sellToken: accountLiq.liquidation.getCollateralUnderlyingAddress(),
          buyToken: flashBorrowAsset,
          amount: accountLiq.flashLoanAmount,
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
      accountLiq: accountLiq,
      flashBorrowAsset: flashBorrowAsset,
      preLiquidationTrade: preLiquidationTrade,
      collateralTrade: collateralTrade,
    };
  }

  public async getPossibleLiquidations(
    ra: RiskyAccount
  ): Promise<FlashLiquidation> {
    const netUnderlying = Array.from(ra.netUnderlyingAvailable.entries());
    const netDebt = netUnderlying.filter(([_, n]) => n.isNegative());

    const possibleLiquidations = netUnderlying.flatMap(
      ([currencyId, netLocal]) => {
        const liquidations: Liquidation[] = [];

        if (!netLocal.isZero()) {
          if (
            ra.data.balances.find(
              (a) => a.currencyId === currencyId && !a.nTokenBalance.isZero()
            )
          ) {
            // has ntoken local currency liquidation
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
            ra.data.portfolio.find(
              (a) => a.currencyId === currencyId && getNowSeconds() < a.maturity
            )
          ) {
            const asset = ra.data.portfolio
              // Sort descending so we get the largest value
              .sort((a, b) => (b.notional.lt(a.notional) ? 1 : -1))
              .find(
                (a) =>
                  a.currencyId === currencyId && getNowSeconds() < a.maturity
              );

            // Only liquidate one fCash asset at a time
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
          // collateral is possible, so check all the combinations with debts
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

    const calls = possibleLiquidations.flatMap((l) =>
      l.getFlashLoanAmountCall(this.notionalContract, ra.id)
    );
    const { results } = await aggregate(calls, this.provider, undefined, true);

    const accountLiquidations = possibleLiquidations
      .map((l) => {
        const loanAmount = results[
          `${ra.id}:${l.getLiquidationType()}:${
            l.getLocalCurrency().id
          }:${l.getCollateralCurrencyId()}:loanAmount`
        ] as BigNumber;

        return {
          accountId: ra.id,
          liquidation: l,
          flashLoanAmount: loanAmount
            .mul(this.settings.flashLoanBuffer)
            .div(1000),
        };
      })
      .filter((l) => !l.flashLoanAmount.isZero())
      .sort((a, b) => (b.flashLoanAmount.lt(a.flashLoanAmount) ? -1 : 1));

    for (const a of accountLiquidations) {
      try {
        return await this.getFlashLiquidation(a);
      } catch (e) {
        // TODO: maybe log something here?
        // If this fails then go on to the next liquidation
      }
    }
  }

  public async liquidateAccount(flashLiq: FlashLiquidation) {
    // TODO: perhaps aggregate this and switch to use the `liquidateViaMulticall`
    // method in the VaultV3Liquidator
    const { data, to } = await this.flashLoanProvider.encodeTransaction(
      flashLiq
    );

    const resp = await sendTxThroughRelayer({
      env: {
        NETWORK: this.settings.network,
        TX_RELAY_AUTH_TOKEN: this.settings.txRelayAuthToken,
      },
      to,
      data,
    });

    if (resp.status == 200) {
      const respInfo = await resp.json();
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
        text: `Liquidated account ${flashLiq.accountLiq.accountId}, ${respInfo['hash']}`,
      });
    }
  }
}
