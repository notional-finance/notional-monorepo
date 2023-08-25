import { Network, filterEmpty } from '@notional-finance/util';
import { Routes } from '../server';
import { SingleSidedLP, VaultMetadata } from '../vaults';
import { ClientRegistry } from './client-registry';
import { map } from 'rxjs';

export class VaultRegistryClient extends ClientRegistry<VaultMetadata> {
  protected override cachePath() {
    return Routes.Vaults;
  }

  getVaultAdapter(network: Network, vaultAddress: string) {
    console.log(vaultAddress);
    const params = this.getLatestFromSubject(network, vaultAddress);
    if (!params) throw Error('No vault params found');
    return new SingleSidedLP(network, vaultAddress, params);
  }

  subscribeVaultAdapter(network: Network, vaultAddress: string) {
    return this.subscribeSubject(network, vaultAddress.toLowerCase())?.pipe(
      filterEmpty(),
      map((p) => new SingleSidedLP(network, vaultAddress, p))
    );
  }
}
