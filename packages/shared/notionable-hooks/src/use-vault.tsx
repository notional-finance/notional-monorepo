import { useCurrentNetworkStore } from './context/use-root-store';

export function useVaultMetadata(vaultAddress?: string) {
  const currentNetworkStore = useCurrentNetworkStore();
  return vaultAddress
    ? currentNetworkStore.getVaultConfig(vaultAddress)
    : undefined;
}

export function useAllVaults() {
  const currentNetworkStore = useCurrentNetworkStore();
  return currentNetworkStore.getAllListedVaults();
}
