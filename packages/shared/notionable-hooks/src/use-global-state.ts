import { useGlobalContext } from './context/NotionalContext';

export function useFiat() {
  const { state: { baseCurrency } } = useGlobalContext();
  return baseCurrency
}

export function useThemeVariant() {
  const { state: { themeVariant } } = useGlobalContext();
  return themeVariant
}

