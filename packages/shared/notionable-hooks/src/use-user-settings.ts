import { Registry } from '@notional-finance/core-entities';
import { useAppContext, useNotionalContext } from './use-notional';
import { Network } from '@notional-finance/util';

export function useFiat() {
  const {
    appState: { baseCurrency },
  } = useAppContext();
  return baseCurrency;
}

export function useFiatToken() {
  const {
    appState: { baseCurrency },
  } = useAppContext();
  return Registry.getTokenRegistry().getTokenBySymbol(
    Network.all,
    baseCurrency
  );
}

export function useThemeVariant() {
  const {
    globalState: { themeVariant },
  } = useNotionalContext();
  return themeVariant;
}
