import { Network, filterEmpty } from '@notional-finance/util';
import { Routes } from '../server';
import { SingleSidedLP, VaultMetadata } from '../vaults';
import { ClientRegistry } from './client-registry';
import { map } from 'rxjs';
import { SingleSidedLPParams } from '../vaults/SingleSidedLP';
import { PendlePT, PendlePTVaultParams } from '../vaults/PendlePT';
import { getVaultType } from '../config/whitelisted-vaults';

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
    const vaultType = getVaultType(vaultAddress, network);
    switch (vaultType) {
      case 'SingleSidedLP':
        return new SingleSidedLP(
          network,
          vaultAddress,
          params as SingleSidedLPParams
        );
      case 'PendlePT':
        return new PendlePT(
          network,
          vaultAddress,
          params as PendlePTVaultParams
        );
      default:
        throw Error(`Unknown vault type: ${vaultType}`);
    }
  }

  subscribeVaultAdapter(network: Network, vaultAddress: string) {
    return this.subscribeSubject(network, vaultAddress.toLowerCase())?.pipe(
      filterEmpty(),
      map((params) => {
        const vaultType = getVaultType(vaultAddress, network);
        switch (vaultType) {
          case 'SingleSidedLP':
            return new SingleSidedLP(
              network,
              vaultAddress,
              params as SingleSidedLPParams
            );
          case 'PendlePT':
            return new PendlePT(
              network,
              vaultAddress,
              params as PendlePTVaultParams
            );
          default:
            throw Error(`Unknown vault type: ${vaultType}`);
        }
      })
    );
  }
}
