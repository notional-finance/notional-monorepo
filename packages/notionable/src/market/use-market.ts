import { TypedBigNumber } from '@notional-finance/sdk-v2';
import { Market } from '@notional-finance/sdk-v2/system';
import { useObservableState } from 'observable-hooks';
import { useCurrencyData } from '../currency/use-currency';
import { initialMarketState, marketState$ } from './market-store';

export const useAllMarkets = () => {
  const { currencyMarkets } = useObservableState(
    marketState$,
    initialMarketState
  );

  return {
    currencyMarkets,
  };
};

export const useMarkets = (
  selectedToken: string | null | undefined
): Market[] => {
  const { currencyMarkets } = useAllMarkets();
  const { id } = useCurrencyData(selectedToken);

  return (id ? currencyMarkets.get(id)?.orderedMarkets : []) || [];
};

export const useSelectedMarket = (selectedMarketKey: string | null) => {
  const { currencyMarkets } = useAllMarkets();
  if (!selectedMarketKey) return undefined;

  // MarketKey is currencyId:marketIndex:maturity
  const [currencyId] = selectedMarketKey.split(':');
  return currencyMarkets
    .get(Number(currencyId))
    ?.markets.get(selectedMarketKey);
};

export const useMaturityData = (
  selectedToken: string | null,
  _underlyingAmount: TypedBigNumber | undefined
) => {
  const markets = useMarkets(selectedToken);
  const underlyingAmount = _underlyingAmount?.toUnderlying(true);

  return markets.map((m, index) => {
    let tradeRate = Market.formatInterestRate(m.marketAnnualizedRate());
    let fCashAmount: TypedBigNumber | undefined;
    if (underlyingAmount) {
      try {
        fCashAmount = m.getfCashAmountGivenCashAmount(underlyingAmount);
        tradeRate = Market.formatInterestRate(
          m.interestRate(fCashAmount, underlyingAmount)
        );
      } catch {
        // This will disable the card
        tradeRate = '';
      }
    }

    return {
      marketKey: m.marketKey,
      tradeRate,
      maturity: m.maturity,
      hasLiquidity: m.hasLiquidity,
      isFirstChild: index === 0,
      isLastChild: markets.length - 1 === index,
      fCashAmount,
      cashAmount: underlyingAmount,
    };
  });
};
