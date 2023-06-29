import { useObservableState } from 'observable-hooks';
import {
  currencyState$,
  initialCurrencyState,
} from '@notional-finance/notionable';
// TODO: deprecate....

export function useCurrency() {
  const { currencies, tradableCurrencies, tokens, systemTokens } =
    useObservableState(currencyState$, initialCurrencyState);

  const allCurrencyList = [...currencies.values()].sort((a, b) => a.id - b.id);
  const allCurrencySymbols = allCurrencyList
    .flatMap(({ assetSymbol, underlyingSymbol }) => [
      assetSymbol,
      underlyingSymbol,
    ])
    .filter((s) => s !== undefined);

  const tradableCurrencyList = [...tradableCurrencies.values()].sort(
    (a, b) => a.id - b.id
  );

  const tradableCurrencySymbols: string[] = tradableCurrencyList
    .flatMap(({ assetSymbol, underlyingSymbol }) => [
      assetSymbol,
      underlyingSymbol,
    ])
    .filter((s) => s !== undefined);

  const systemTokenSymbols: string[] = [...systemTokens.values()].flatMap(
    ({ symbol }) => [symbol]
  );

  return {
    currencies,
    allCurrencySymbols,
    tradableCurrencies,
    tokens,
    systemTokenSymbols,
    tradableCurrencySymbols,
    tradableCurrencyList,
  };
}
