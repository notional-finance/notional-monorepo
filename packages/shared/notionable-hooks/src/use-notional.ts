import { Network } from '@notional-finance/util';
import { useAppStore, useCurrentNetworkStore } from './context/use-root-store';
import { getNetworkModel } from '@notional-finance/core-entities';
import { useObserver } from 'mobx-react-lite';

export function useAppReady() {
  const appStore = useAppStore();
  return appStore.isAppReady;
}

export function useLastUpdateBlockNumber() {
  const currentNetworkStore = useCurrentNetworkStore();
  return currentNetworkStore.lastUpdatedBlock;
}

export function useNOTE(network: Network | undefined) {
  return useObserver(() =>
    network ? getNetworkModel(network).getTokenBySymbol('NOTE') : undefined
  );
}
