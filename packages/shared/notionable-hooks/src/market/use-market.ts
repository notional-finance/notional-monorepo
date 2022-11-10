import { TypedBigNumber } from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { convertRateToFloat } from '@notional-finance/utils';
import { useObservableState } from 'observable-hooks';
import { useCurrencyData } from '../currency/use-currency';
import { initialMarketState, marketState$, MaturityData } from '@notional-finance/notionable';

export const useAllMarkets = () => {
  const { currencyMarkets } = useObservableState(marketState$, initialMarketState);

  const orderedCurrencyIds = Array.from(currencyMarkets.keys()).sort();

  const rates = orderedCurrencyIds.map((i) => {
    try {
      const { orderedMarkets } = currencyMarkets.get(i)!;

      return orderedMarkets.reduce((maxRate: number, m) => {
        const rate = m.marketAnnualizedRate();
        if (maxRate === 0) return rate;

        return rate > maxRate ? rate : maxRate;
      }, 0);
    } catch {
      return 0;
    }
  });

  const unwrappedCurrencies = orderedCurrencyIds.map((i) => {
    const { symbol, underlyingSymbol } = currencyMarkets.get(i)!;
    return underlyingSymbol || symbol;
  });

  const cTokens = orderedCurrencyIds.map((i) => {
    const { symbol } = currencyMarkets.get(i)!;
    return symbol;
  });

  const largestLendRate = Market.formatInterestRate(Math.max(...rates), 2);

  return {
    orderedCurrencyIds,
    currencyMarkets,
    rates,
    unwrappedCurrencies,
    cTokens,
    largestLendRate,
  };
};

export const useMarkets = (selectedToken: string | null | undefined): Market[] => {
  const { currencyMarkets } = useAllMarkets();
  const { id } = useCurrencyData(selectedToken);

  return (id ? currencyMarkets.get(id)?.orderedMarkets : []) || [];
};

export const useSelectedMarket = (selectedMarketKey: string | null) => {
  const { currencyMarkets } = useAllMarkets();
  if (!selectedMarketKey) return undefined;

  // MarketKey is currencyId:marketIndex:maturity
  const currencyId = Market.parseCurrencyId(selectedMarketKey);
  return currencyMarkets.get(currencyId)?.markets.get(selectedMarketKey);
};

export const useMaturityData = (
  selectedToken: string | null,
  _underlyingAmount: TypedBigNumber | undefined
): MaturityData[] => {
  const markets = useMarkets(selectedToken);
  const underlyingAmount = _underlyingAmount?.toUnderlying(true);

  return markets.map((m) => {
    let tradeRate: number | undefined = m.marketAnnualizedRate();
    let fCashAmount: TypedBigNumber | undefined;
    if (underlyingAmount) {
      try {
        fCashAmount = m.getfCashAmountGivenCashAmount(underlyingAmount);
        tradeRate = m.interestRate(fCashAmount, underlyingAmount);
      } catch {
        // This will disable the card
        tradeRate = undefined;
      }
    }

    return {
      marketKey: m.marketKey,
      tradeRate: tradeRate ? convertRateToFloat(tradeRate) : undefined,
      tradeRateString: tradeRate !== undefined ? Market.formatInterestRate(tradeRate) : '',
      maturity: m.maturity,
      hasLiquidity: m.hasLiquidity,
      fCashAmount,
      cashAmount: underlyingAmount,
    };
  });
};
