import { useNotionalContext } from './use-notional';

export function useFiat() {
  const { globalState: { baseCurrency } } = useNotionalContext();
  return baseCurrency
}

export function useThemeVariant() {
  const { globalState: { themeVariant } } = useNotionalContext();
  return themeVariant
}

