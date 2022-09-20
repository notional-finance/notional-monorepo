import {
  ETHER_CURRENCY_ID,
  INTERNAL_TOKEN_DECIMAL_PLACES,
  INTERNAL_TOKEN_PRECISION,
  NOTE_CURRENCY_ID,
  STAKED_NOTE_CURRENCY_ID,
} from '@notional-finance/sdk-v2/config/constants';
import { ethers } from 'ethers';
import { useObservableState } from 'observable-hooks';
import { useNotional } from '../notional/use-notional';
import { currencyState$, initialCurrencyState } from './currency-store';

export function useCurrency() {
  const { currencies, tradableCurrencies, tokens, systemTokens } = useObservableState(
    currencyState$,
    initialCurrencyState
  );

  const allCurrencyList = [...currencies.values()].sort((a, b) => a.id - b.id);
  const allCurrencySymbols = allCurrencyList
    .flatMap(({ assetSymbol, underlyingSymbol }) => [assetSymbol, underlyingSymbol])
    .filter((s) => s !== undefined);

  const tradableCurrencyList = [...tradableCurrencies.values()].sort((a, b) => a.id - b.id);

  const tradableCurrencySymbols: string[] = tradableCurrencyList
    .flatMap(({ assetSymbol, underlyingSymbol }) => [assetSymbol, underlyingSymbol])
    .filter((s) => s !== undefined);

  const systemTokenSymbols: string[] = [...systemTokens.values()].flatMap(({ symbol }) => [symbol]);

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

export function useCurrencyData(symbol: string | null | undefined) {
  const { system } = useNotional();
  if (!symbol) {
    return {
      id: undefined,
      decimalPlaces: undefined,
      decimals: undefined,
      isUnderlying: false,
      isTradable: false,
    };
  } else if (symbol === 'NOTE') {
    return {
      id: NOTE_CURRENCY_ID,
      decimalPlaces: INTERNAL_TOKEN_DECIMAL_PLACES,
      decimals: INTERNAL_TOKEN_PRECISION,
      isUnderlying: false,
      isTradable: false,
    };
  } else if (symbol === 'sNOTE') {
    return {
      id: STAKED_NOTE_CURRENCY_ID,
      decimalPlaces: 18,
      decimals: ethers.constants.WeiPerEther,
      isUnderlying: false,
      isTradable: false,
    };
  } else if (symbol === 'WETH') {
    return {
      id: ETHER_CURRENCY_ID,
      decimalPlaces: 18,
      decimals: ethers.constants.WeiPerEther,
      isUnderlying: false,
      isTradable: false,
    };
  } else {
    const currency = system?.getCurrencyBySymbol(symbol);
    const decimalPlaces =
      currency?.underlyingSymbol === symbol
        ? currency.underlyingDecimalPlaces
        : currency?.assetDecimalPlaces;
    const decimals =
      currency?.underlyingSymbol === symbol ? currency.underlyingDecimals : currency?.assetDecimals;

    return {
      id: currency?.id,
      decimalPlaces,
      decimals,
      tokenType: currency?.tokenType,
      assetSymbol: currency?.assetSymbol,
      underlyingSymbol: currency?.underlyingSymbol || currency?.assetSymbol,
      isUnderlying: symbol === (currency?.underlyingSymbol || currency?.assetSymbol),
      isTradable: currency?.nTokenSymbol !== undefined,
      nTokenSymbol: currency?.nTokenSymbol,
    };
  }
}
