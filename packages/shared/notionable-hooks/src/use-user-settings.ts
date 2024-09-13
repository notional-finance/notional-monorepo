import { Registry } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable';


export function useFiatToken() {
  const { baseCurrency } = useAppStore();
  return Registry.getTokenRegistry().getTokenBySymbol(
    Network.all,
    baseCurrency
  );
}
