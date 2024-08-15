import { Registry } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useAppState } from '@notional-finance/notionable';


export function useFiatToken() {
  const { baseCurrency } = useAppState();
  return Registry.getTokenRegistry().getTokenBySymbol(
    Network.all,
    baseCurrency
  );
}
