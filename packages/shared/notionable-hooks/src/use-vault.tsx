import { getVaultType, SingleSidedLP } from '@notional-finance/core-entities';
import {
  useCurrentNetworkStore,
  useVaultStore,
} from './context/use-root-store';

export function useVaultPoints(vaultAddress?: string) {
  const currentNetworkStore = useCurrentNetworkStore();
  return vaultAddress &&
    getVaultType(vaultAddress, currentNetworkStore.network) ===
      'SingleSidedLP_Points'
    ? currentNetworkStore.getVaultAdapter(vaultAddress).getPointMultiples()
    : undefined;
}

export function useVaultRewardTokens(vaultAddress?: string) {
  const currentNetworkStore = useCurrentNetworkStore();
  return vaultAddress &&
    getVaultType(vaultAddress, currentNetworkStore.network) ===
      'SingleSidedLP_DirectClaim'
    ? (
        currentNetworkStore.getVaultAdapter(vaultAddress) as SingleSidedLP
      ).rewardTokens.map((t) => currentNetworkStore.getTokenByID(t))
    : undefined;
}

export function useVaultMetadata(vaultAddress?: string) {
  const vaultStore = useVaultStore();
  return vaultAddress && vaultStore
    ? vaultStore.getVaultByAddress(vaultAddress)
    : undefined;
}
