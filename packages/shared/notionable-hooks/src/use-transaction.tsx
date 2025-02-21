import { Network } from '@notional-finance/util';
import { useWalletStore } from './context/use-root-store';

export function usePendingPnLCalculation(network: Network | undefined) {
  const { pendingPnL } = useWalletStore();

  return (network ? pendingPnL.get(network) : []) as ReturnType<
    typeof pendingPnL.get
  >;
}
