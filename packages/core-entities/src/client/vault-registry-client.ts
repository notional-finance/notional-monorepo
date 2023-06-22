import { Network, filterEmpty } from '@notional-finance/util';
import { Routes } from '../server';
import { SingleSidedLP, VaultMetadata } from '../vaults';
import { ClientRegistry } from './client-registry';
import { ethers } from 'ethers';
import { map } from 'rxjs';

export class VaultRegistryClient extends ClientRegistry<VaultMetadata> {
  protected override cachePath() {
    return Routes.Vaults;
  }

  getVaultAdapter(network: Network, vaultAddress: string) {
    const params = this.getLatestFromSubject(network, vaultAddress);
    if (!params) throw Error('No vault params found');
    return new SingleSidedLP(network, vaultAddress, params);
  }

  subscribeVaultAdapter(network: Network, vaultAddress: string) {
    return this.subscribeSubject(
      network,
      // Converts to a checksummed address
      ethers.utils.getAddress(vaultAddress)
    )?.pipe(
      filterEmpty(),
      map((p) => new SingleSidedLP(network, vaultAddress, p))
    );
  }
}
