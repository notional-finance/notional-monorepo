import { SnapshotOut } from 'mobx-state-tree';
import {
  LendingRouterModel,
  VaultModel,
  WithdrawRequestManagerModel,
} from '../models/ModelTypes';
import { getVaultCMSData } from './cms/vault-cms';
import {
  DocumentTypes,
  fetchGraphPaginate,
  loadGraphClientDeferred,
  ServerRegistry,
  TypedDocumentReturnType,
} from './server-registry';
import { Network } from '@notional-finance/util';
import { BigNumber } from 'ethers';

export type AllConfigurationQuery = {
  lendingRouters: SnapshotOut<typeof LendingRouterModel>[];
  withdrawRequestManagers: SnapshotOut<typeof WithdrawRequestManagerModel>[];
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
    const lendingRouters: TypedDocumentReturnType<
      DocumentTypes['AllLendingRoutersDocument']
    > = (
      await fetchGraphPaginate(
        network,
        AllLendingRoutersDocument,
        'lendingRouters',
        this.env.NX_SUBGRAPH_API_KEY
      )
    )['data'];
    const withdrawRequestManagers: TypedDocumentReturnType<
      DocumentTypes['AllWithdrawRequestManagersDocument']
    > = (
      await fetchGraphPaginate(
        network,
        AllWithdrawRequestManagersDocument,
        'withdrawRequestManagers',
        this.env.NX_SUBGRAPH_API_KEY
      )
    )['data'];
    const vaultGraphData: TypedDocumentReturnType<
      DocumentTypes['AllVaultsDocument']
    > = (
      await fetchGraphPaginate(
        network,
        AllVaultsDocument,
        'vaults',
        this.env.NX_SUBGRAPH_API_KEY
      )
    )['data'];

    const vaultMetadata = await getVaultCMSData();

    // Allow the CMS to define what vaults are available
    const vaults = vaultMetadata
      .map((m) => {
        const vault = vaultGraphData['vaults'].find(
          (v) => v.id.toLowerCase() === m.address.toLowerCase()
        );
        if (!vault) {
          return undefined;
        }
        return {
          ...m,
          vaultAddress: vault.id,
          yieldToken: vault.yieldToken.id,
          vaultToken: vault.vaultToken.id,
          feeRate: BigNumber.from(vault.feeRate).toJSON(),
          withdrawRequestManagers: vault.withdrawRequestManagers.map(
            (r) => r.id
          ),
        };
      })
      .filter((v) => v !== undefined);

    return {
      network,
      lastUpdateTimestamp: new Date().getTime(),
      lastUpdateBlock: lendingRouters['_meta']?.['block']?.['number'] ?? 0,
      values: [
        [
          network,
          {
            lendingRouters: lendingRouters['lendingRouters'].map((r) => {
              return {
                id: r.id,
                name: r.name,
                markets:
                  r.markets?.map((m) => {
                    return {
                      vault: m.vault.id,
                      params: m.params,
                    };
                  }) ?? [],
              };
            }),
            withdrawRequestManagers:
              withdrawRequestManagers.withdrawRequestManagers.map((r) => {
                return {
                  id: r.id,
                  yieldToken: r.yieldToken.id,
                  withdrawToken: r.withdrawToken.id,
                  stakingToken: r.stakingToken.id,
                };
              }),
            vaults,
          },
        ] as [string, AllConfigurationQuery],
      ],
    };
  }
}
