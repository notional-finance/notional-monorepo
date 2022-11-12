import {
  useCurrency,
  useMarkets,
  useMaturityData,
  useSelectedMarket,
  useTokenData,
} from '@notional-finance/notionable-hooks';
import { useObservableState } from 'observable-hooks';
import { useEffect } from 'react';
import { initialLendState, lendState$, updateLendState } from './lend-store';

export function useLend() {
  const { tradableCurrencySymbols: availableCurrencies } = useCurrency();
  const { selectedMarketKey, selectedToken, hasError, inputAmount, fCashAmount } =
    useObservableState(lendState$, initialLendState);
  const markets = useMarkets(selectedToken);
  const selectedMarket = useSelectedMarket(selectedMarketKey);
  const { enabled } = useTokenData(selectedToken);
  const inputAmountUnderlying = inputAmount?.toUnderlying(true);
  const maturityData = useMaturityData(selectedToken, inputAmountUnderlying?.neg());

  const tradedRate =
    inputAmountUnderlying?.isPositive() && fCashAmount
      ? selectedMarket?.interestRate(fCashAmount, inputAmountUnderlying)
      : undefined;

  const interestAmountTBN =
    fCashAmount && inputAmountUnderlying ? fCashAmount.sub(inputAmountUnderlying) : undefined;

  useEffect(() => {
    updateLendState({ inputAmount: undefined });
  }, [selectedToken]);

  return {
    availableCurrencies,
    selectedMarketKey,
    selectedToken,
    canSubmit: hasError === false && !!inputAmount && enabled,
    maturityData,
    fCashAmount: fCashAmount?.toFloat(),
    interestAmount: interestAmountTBN?.toFloat(),
    interestAmountTBN,
    tradedRate,
    markets,
  };
}
