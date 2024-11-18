import { Network } from '@notional-finance/util';
import { useWalletStore } from './context/use-root-store';

// TODO: FIX THIS HOOK. Set up completed and pending txns.
export function usePendingPnLCalculation(network: Network | undefined) {
  const { pendingPnL } = useWalletStore();

  return network ? pendingPnL[network] : [];
}
