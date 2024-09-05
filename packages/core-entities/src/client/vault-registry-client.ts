import { Network } from '@notional-finance/util';
import { Routes } from '../server';
import { VaultAdapter, VaultMetadata } from '../vaults';
import { ClientRegistry } from './client-registry';

export class VaultRegistryClient extends ClientRegistry<VaultMetadata> {
  protected override cachePath() {
    return Routes.Vaults;
  }

  isVaultEnabled(network: Network, vaultAddress: string) {
    const params = this.getLatestFromSubject(network, vaultAddress);
    return params?.enabled || false;
  }

  getVaultAdapter(network: Network, vaultAddress: string) {
    const params = this.getLatestFromSubject(network, vaultAddress);
    if (!params) throw Error(`No vault params found: ${vaultAddress}`);
    return {} as VaultAdapter;
  }
}
