import { Registry } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useAppState } from './use-app-state';


export function useFiatToken() {
  const { baseCurrency } = useAppState();
  return Registry.getTokenRegistry().getTokenBySymbol(
    Network.all,
    baseCurrency
  );
}
