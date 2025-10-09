import {
  getNetworkModel,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { useEffect } from 'react';
import { useCurrentNetworkStore } from './context/use-root-store';
import { useObserver } from 'mobx-react-lite';

export interface MaturityData {
  token: TokenDefinition;
  tokenId: string;
  tradeRate: number | undefined;
  maturity: number;
}

export function useVaultAdapter(vaultAddress: string | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady() && vaultAddress
      ? currentNetworkStore.getVaultAdapter(vaultAddress)
      : undefined;
  } catch {
    return undefined;
  }
}

export const useSNOTEPool = () => {
  return useObserver(() => {
    const mainnet = getNetworkModel(Network.mainnet);
    try {
      return mainnet.isReady() ? mainnet.getSNOTEPool() : undefined;
    } catch {
      return undefined;
    }
  });
};

export function useFetchAnalyticsData(
  id: string,
  isLoaded: boolean,
  network: Network | undefined
) {
  useEffect(() => {
    if (!isLoaded && network)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getNetworkModel(network).fetchAnalyticsData(id as any);
  }, [id, isLoaded, network]);
}

export function usePointPrices() {
  const pointPrices = useObserver(() => {
    return getNetworkModel(Network.all).getPointPrices();
  });
  useFetchAnalyticsData('pointPrices', !!pointPrices, Network.all);
  return pointPrices;
}
