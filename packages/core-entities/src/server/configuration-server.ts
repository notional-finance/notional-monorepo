import { SnapshotOut } from 'mobx-state-tree';
import { VaultModel } from '../models/ModelTypes';
import { getVaultCMSData } from './cms/vault-cms';
import {
  DocumentTypes,
  fetchUsingGraph,
  loadGraphClientDeferred,
  ServerRegistry,
  TypedDocumentReturnType,
} from './server-registry';
import { Network } from '@notional-finance/util';

export type AllConfigurationQuery = {
  lendingRouters: TypedDocumentReturnType<
    DocumentTypes['AllLendingRoutersDocument']
  >;
  withdrawRequestManagers: TypedDocumentReturnType<
    DocumentTypes['AllWithdrawRequestManagersDocument']
  >;
  vaults: SnapshotOut<typeof VaultModel>[];
};

export class ConfigurationServer extends ServerRegistry<AllConfigurationQuery> {
  /** Returns the all configuration query type as is, parsing will be done in the client */
  protected async _refresh(network: Network) {
    const {
      AllLendingRoutersDocument,
      AllWithdrawRequestManagersDocument,
      AllVaultsDocument,
    } = await loadGraphClientDeferred();
    const lendingRouters = await fetchUsingGraph(
      network,
      AllLendingRoutersDocument,
      (r) => {
        return { [network]: r };
      },
      this.env.NX_SUBGRAPH_API_KEY
    );
    const withdrawRequestManagers = await fetchUsingGraph(
      network,
      AllWithdrawRequestManagersDocument,
      (r) => {
        return { [network]: r };
      },
      this.env.NX_SUBGRAPH_API_KEY
    );
    const vaultGraphData = await fetchUsingGraph(
      network,
      AllVaultsDocument,
      (r) => {
        return { [network]: r };
      },
      this.env.NX_SUBGRAPH_API_KEY
    );

    const vaultMetadata = await getVaultCMSData();

    // Allow the CMS to define what vaults are available
    const vaults = vaultMetadata.map((m) => {
      const vault = vaultGraphData.values[network].find(
        (v) => v.vaultAddress === m.address
      );
      if (!vault) {
        throw new Error(`Vault ${m.address} not found in graph data`);
      }
      return {
        ...m,
        vaultAddress: vault.vaultAddress,
        yieldToken: vault.yieldToken,
        vaultToken: vault.vaultToken,
        feeRate: vault.feeRate,
        withdrawRequestManagers: vault.withdrawRequestManagers,
      };
    });

    return {
      ...lendingRouters,
      values: [
        [
          network,
          {
            lendingRouters: lendingRouters.values[network],
            withdrawRequestManagers: withdrawRequestManagers.values[network],
            vaults,
          },
        ] as [string, AllConfigurationQuery],
      ],
    };
  }
}
