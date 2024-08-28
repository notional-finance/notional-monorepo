import { Registry } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useAppStore } from './context/AppContext';


export function useFiatToken() {
  const { baseCurrency } = useAppStore();
  return Registry.getTokenRegistry().getTokenBySymbol(
    Network.all,
    baseCurrency
  );
}
