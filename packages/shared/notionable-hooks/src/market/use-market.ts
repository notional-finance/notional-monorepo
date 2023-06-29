import { Market } from '@notional-finance/sdk/src/system';
import { formatMaturity } from '@notional-finance/helpers';
import { useObservableState } from 'observable-hooks';
import { initialMarketState, marketState$ } from '@notional-finance/notionable';
import { useSelectedNetwork } from '../notional/use-notional';
import { fCashMarket, Registry } from '@notional-finance/core-entities';
import { EMPTY } from 'rxjs';
import { useMemo } from 'react';

interface AllRates {
  rate: string;
  maturity: string;
}
interface CardData {
  symbol: string;
  minRate: number;
  maxRate: number;
  allRates: AllRates[];
}

export const useAllMarkets = () => {
  const { currencyMarkets } = useObservableState(
    marketState$,
    initialMarketState
  );

  const orderedCurrencyIds = Array.from(currencyMarkets.keys()).sort();

  const getMaxOrMinRates = (returnMax: boolean) => {
    return orderedCurrencyIds.map((i) => {
      try {
        const { orderedMarkets } = currencyMarkets.get(i)!;

        return orderedMarkets.reduce((maxRate: number, m) => {
          const rate = m.marketAnnualizedRate();
          if (maxRate === 0) return rate;
          const maxRates = rate > maxRate ? rate : maxRate;
          const minRates = rate < maxRate ? rate : maxRate;
          return returnMax ? maxRates : minRates;
        }, 0);
      } catch {
        return 0;
      }
    });
  };

  const getCardData = (): CardData[] => {
    return orderedCurrencyIds.map((id, index) => {
      const { symbol, underlyingSymbol } = currencyMarkets.get(id)!;
      const { orderedMarkets } = currencyMarkets.get(id)!;
      const minRates = getMaxOrMinRates(false);
      const maxRates = getMaxOrMinRates(true);

      return {
        symbol: underlyingSymbol || symbol,
        minRate: minRates.length > index ? minRates[index] : 0,
        maxRate: maxRates.length > index ? maxRates[index] : 0,
        allRates: orderedMarkets.map((data) => {
          return {
            rate: Market.formatInterestRate(data.marketAnnualizedRate(), 2),
            maturity: formatMaturity(data.maturity),
          };
        }),
      };
    });
  };

  const unwrappedCurrencies = orderedCurrencyIds.map((i) => {
    const { symbol, underlyingSymbol } = currencyMarkets.get(i)!;
    return underlyingSymbol || symbol;
  });

  const cTokens = orderedCurrencyIds.map((i) => {
    const { symbol } = currencyMarkets.get(i)!;
    return symbol;
  });

  return {
    orderedCurrencyIds,
    currencyMarkets,
    maxRates: getMaxOrMinRates(true),
    cardData: getCardData(),
    unwrappedCurrencies,
    cTokens,
  };
};

export const useFCashMarket = (currencyId?: number) => {
  const selectedNetwork = useSelectedNetwork();

  const nToken = useMemo(() => {
    try {
      return selectedNetwork
        ? Registry.getTokenRegistry().getNToken(selectedNetwork, currencyId)
        : undefined;
    } catch {
      return undefined;
    }
  }, [selectedNetwork, currencyId]);

  const fCashMarket$ = useMemo(() => {
    return selectedNetwork && nToken
      ? Registry.getExchangeRegistry().subscribePoolInstance<fCashMarket>(
          selectedNetwork,
          nToken.address
        )
      : undefined;
  }, [selectedNetwork, nToken]);

  return useObservableState<fCashMarket>(fCashMarket$ || EMPTY);
};
