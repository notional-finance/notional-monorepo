import { Network } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable';
import { TokenBalance } from '@notional-finance/core-entities';

export function useFiatToken() {
  const { baseCurrency } = useAppStore();
  return new TokenBalance(0, baseCurrency, Network.all).token;
}
