import { VaultFactory } from '@notional-finance/sdk';
import { useNotional } from '../notional/use-notional';

export const useBaseVault = (vaultAddress?: string) => {
  const { system } = useNotional();
  const vaultConfig = vaultAddress ? system?.getVault(vaultAddress) : undefined;
  return vaultConfig && system
    ? VaultFactory.buildVaultFromCache(vaultConfig.strategy, vaultConfig.vaultAddress)
    : undefined;
};
