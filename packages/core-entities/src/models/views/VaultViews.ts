import { SingleSidedLP } from '../../vaults';
import { NetworkModelType } from '../NetworkModel';

export const VaultViews = (self: NetworkModelType) => {
  const isVaultEnabled = (vaultAddress: string) => {
    return self.vaults.get(vaultAddress)?.enabled || false;
  };

  const getVaultAdapter = (vaultAddress: string) => {
    const params = self.vaults.get(vaultAddress);
    if (!params) throw Error(`No vault params found: ${vaultAddress}`);
    return new SingleSidedLP(self.network, vaultAddress, params);
  };

  const getVaultName = (vaultAddress: string) => {
    const vault = self.vaults.get(vaultAddress);
    if (!vault) throw Error(`No vault params found: ${vaultAddress}`);
    return vault.name;
  };

  return {
    isVaultEnabled,
    getVaultAdapter,
    getVaultName,
  };
};
