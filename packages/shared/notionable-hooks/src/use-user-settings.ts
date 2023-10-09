import { Registry } from '@notional-finance/core-entities';
import { useNotionalContext } from './use-notional';
import { Network } from '@notional-finance/util';

export function useFiat() {
  const {
    globalState: { baseCurrency },
  } = useNotionalContext();
  return baseCurrency;
}

export function useFiatToken() {
  const {
    globalState: { baseCurrency },
  } = useNotionalContext();
  return Registry.getTokenRegistry().getTokenBySymbol(
    Network.All,
    baseCurrency
  );
}

export function useThemeVariant() {
  const {
    globalState: { themeVariant },
  } = useNotionalContext();
  return themeVariant;
}
