import { utils } from 'ethers';
import { Market, System } from '../system';
import { AssetType, TradeHistory, TransactionHistory } from '../libs/types';
import { getNowSeconds } from '../libs/utils';
import AccountData from './AccountData';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { Asset, Currency } from '../data';

export default class AssetSummary {
  public maturity: number;

  public currencyId: number;

  private currency: Currency;

  public get hasMatured() {
    return this.maturity < getNowSeconds();
  }

  public get underlyingSymbol() {
    return this.currency.underlyingSymbol || this.currency.assetSymbol;
  }

  public get symbol() {
    return this.currency.assetSymbol;
  }

  public get market() {
    const markets = System.getSystem().getMarkets(this.currencyId);
    return markets.find((m) => m.maturity === this.maturity);
  }

  public get hashKey() {
    return utils.id(`${this.assetKey}:${this.fCash?.notional.toString()}:${this.liquidityToken?.notional.toString()}`);
  }

  public mostRecentTradedRate() {
    if (this.history.length === 0) return undefined;
    return this.history[this.history.length - 1].tradedInterestRate;
  }

  constructor(
    public assetKey: string,
    public underlyingInternalPV: TypedBigNumber,
    public fCashValue: TypedBigNumber,
    public history: TradeHistory[],
    public fCash?: Asset,
    public liquidityToken?: Asset
  ) {
    if (!fCash && !liquidityToken) throw new Error('Invalid asset summary input');
    this.maturity = (fCash?.maturity || liquidityToken?.maturity) as number;
    this.currencyId = (fCash?.currencyId || liquidityToken?.currencyId) as number;
    this.currency = System.getSystem().getCurrencyById(this.currencyId);
  }

  public static getTransactionHistory(history: TradeHistory[]): TransactionHistory[] {
    return history.map((h) => ({
      currencyId: h.currencyId,
      txnType: h.tradeType,
      timestampMS: h.blockTime.getTime(),
      transactionHash: h.transactionHash,
      amount: h.netUnderlyingCash,
      maturity: h.maturity.toNumber(),
      rate: h.tradedInterestRate,
    }));
  }

  public getTransactionHistory(): TransactionHistory[] {
    return AssetSummary.getTransactionHistory(this.history);
  }

  public getRollFactors(rollfCashAmount: TypedBigNumber) {
    const markets = System.getSystem().getMarkets(this.currencyId);
    const matchingMarket = this.market;
    const rollMarkets = markets.filter((m) => m.maturity > this.maturity) || [];

    if (!matchingMarket) return [];

    return rollMarkets.map((m) => {
      // Lend: Cash withdrawn from current market, netCashToAccount is positive
      // Borrow: Cost to repay into current market, netCashToAccount is negative
      try {
        const { netCashToAccount } = matchingMarket.getCashAmountGivenfCashAmount(rollfCashAmount.neg());

        // Lend: Cash lent to new market, newfCash is positive
        // Borrow: Cash to borrow from new market, newfCash is negative
        const newfCash = m.getfCashAmountGivenCashAmount(netCashToAccount.neg());

        const tradeRate = Market.exchangeToInterestRate(
          Market.exchangeRate(newfCash, netCashToAccount),
          getNowSeconds(),
          m.maturity
        );

        return {
          tradeRate,
          netCashToAccount,
          newfCash,
          market: m,
        };
      } catch {
        return {
          tradeRate: undefined,
          netCashToAccount: undefined,
          newfCash: undefined,
          market: m,
        };
      }
    });
  }

  /**
   * Builds a summary of a portfolio given the current account portfolio and the trade history.
   * @param accountData
   */
  public static build(accountData: AccountData) {
    const system = System.getSystem();
    // Reduce portfolio to combine fCash and liquidity tokens at the same maturity, if liquidity tokens
    // exist. This makes it easier to reason about.
    const assetsReduced = accountData.portfolio.reduce(
      /* eslint-disable no-param-reassign */
      (obj, a) => {
        const assetKey = `${a.currencyId.toString()}:${a.maturity.toString()}`;
        if (!obj[assetKey]) {
          obj[assetKey] = {};
        }

        if (a.assetType === AssetType.fCash) {
          obj[assetKey].fCash = a;
        } else {
          obj[assetKey].liquidityToken = a;
        }

        return obj;
      },
      /* eslint-enable no-param-reassign */
      {} as {
        [assetKey: string]: {
          fCash?: Asset;
          liquidityToken?: Asset;
        };
      }
    );

    return Object.keys(assetsReduced)
      .map((assetKey) => {
        // Returns the trade history for each asset key
        const filteredHistory = accountData.getAssetHistory(assetKey);
        const { liquidityToken, fCash } = assetsReduced[assetKey];
        const currency = system.getCurrencyById(liquidityToken?.currencyId || (fCash?.currencyId as number));
        const underlyingSymbol = system.getUnderlyingSymbol(currency.id);
        const { underlyingInternalPV, fCashValue } = AssetSummary.getAssetValue(
          system,
          underlyingSymbol,
          liquidityToken,
          fCash
        );

        return new AssetSummary(assetKey, underlyingInternalPV, fCashValue, filteredHistory, fCash, liquidityToken);
      })
      .sort((a, b) => a.assetKey.localeCompare(b.assetKey, 'en'));
  }

  private static getAssetValue(system: System, underlyingSymbol: string, liquidityToken?: Asset, fCash?: Asset) {
    const currencyId = fCash?.currencyId || liquidityToken?.currencyId;
    if (!currencyId) throw new Error('Currency id not found when mapping assets');
    const cashGroup = system.getCashGroup(currencyId);

    // Get the underlying PV and fCash value of the asset
    let underlyingInternalPV = TypedBigNumber.from(0, BigNumberType.InternalUnderlying, underlyingSymbol);
    let fCashValue = TypedBigNumber.from(0, BigNumberType.InternalUnderlying, underlyingSymbol);
    if (liquidityToken) {
      const { fCashClaim, assetCashClaim } = cashGroup.getLiquidityTokenValue(
        liquidityToken.assetType,
        liquidityToken.notional,
        false
      );

      fCashValue = fCashClaim;
      underlyingInternalPV = cashGroup
        .getfCashPresentValueUnderlyingInternal(liquidityToken.maturity, fCashClaim, false)
        .add(assetCashClaim.toUnderlying());
    }

    // Use a fall through here because liquidity tokens and fCash will sit on the same asset key
    if (fCash) {
      fCashValue = fCashValue.add(fCash.notional);
      underlyingInternalPV = underlyingInternalPV.add(
        cashGroup.getfCashPresentValueUnderlyingInternal(fCash.maturity, fCash.notional, false)
      );
    }

    return { underlyingInternalPV, fCashValue };
  }
}
