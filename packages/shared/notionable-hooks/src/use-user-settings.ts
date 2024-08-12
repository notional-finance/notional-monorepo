import { Registry } from '@notional-finance/core-entities';
import { useAppContext, useNotionalContext } from './use-notional';
import { Network } from '@notional-finance/util';
import { useMemo } from 'react';

export function useFiat() {
  const {
    appState: { baseCurrency },
  } = useAppContext();

  const selectedBaseCurrency = useMemo(() => baseCurrency, [baseCurrency]);
  return selectedBaseCurrency;
}

export function useFiatToken() {
  const {
    appState: { baseCurrency },
  } = useAppContext();

  const fiatToken = useMemo(() => Registry.getTokenRegistry().getTokenBySymbol(
    Network.all,
    baseCurrency
  ), [baseCurrency]);

  return fiatToken;
}

export function useThemeVariant() {
  const {
    globalState: { themeVariant },
  } = useNotionalContext();

  const theme = useMemo(() => themeVariant, [themeVariant]);
  return theme;
}
