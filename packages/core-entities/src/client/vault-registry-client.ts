import { Network, filterEmpty } from '@notional-finance/util';
import { Routes } from '../server';
import { SingleSidedLP, VaultMetadata } from '../vaults';
import { ClientRegistry } from './client-registry';
import { map } from 'rxjs';
import { SingleSidedLPParams } from '../vaults/SingleSidedLP';
import { PendlePT, PendlePTVaultParams } from '../vaults/PendlePT';

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
    return vaultAddress.toLowerCase() ===
      '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3'
      ? new PendlePT(network, vaultAddress, params as PendlePTVaultParams)
      : new SingleSidedLP(network, vaultAddress, params as SingleSidedLPParams);
  }

  subscribeVaultAdapter(network: Network, vaultAddress: string) {
    return this.subscribeSubject(network, vaultAddress.toLowerCase())?.pipe(
      filterEmpty(),
      map((params) =>
        vaultAddress.toLowerCase() ===
        '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3'
          ? new PendlePT(network, vaultAddress, params as PendlePTVaultParams)
          : new SingleSidedLP(
              network,
              vaultAddress,
              params as SingleSidedLPParams
            )
      )
    );
  }
}
