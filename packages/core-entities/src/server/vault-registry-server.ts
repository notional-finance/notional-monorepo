import {
  ServerRegistry,
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from './server-registry';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { Contract } from 'ethers';
import { TokenBalance } from '../token-balance';
import { DeprecatedVaults, vaultOverrides } from './vault-overrides';

export class VaultRegistryServer extends ServerRegistry<VaultMetadata> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllVaultsDocument, AllVaultsByBlockDocument } =
      await loadGraphClientDeferred();

    const data =
      blockNumber === undefined
        ? await fetchGraphPaginate(
            network,
            AllVaultsDocument,
            'vaultConfigurations',
            this.env.NX_SUBGRAPH_API_KEY
          )
        : await fetchGraphPaginate(
            network,
            AllVaultsByBlockDocument,
            'vaultConfigurations',
            this.env.NX_SUBGRAPH_API_KEY,
            { blockNumber }
          );

    const calls = data['data'].vaultConfigurations
      .filter(
        (v: { vaultAddress: string }) =>
          !DeprecatedVaults.includes(v.vaultAddress)
      )
      .map(
        ({
          vaultAddress,
          enabled,
          name,
        }: {
          vaultAddress: string;
          enabled: boolean;
          name: string;
        }) => {
          const override = vaultOverrides[vaultAddress];
          if (override) {
            const bn = data['data']._meta.block.number as number;
            const func = override.find((o) => {
              if (o.fromBlock && (blockNumber || bn) < o.fromBlock) {
                return false;
              }
              if (o.toBlock && (blockNumber || bn) > o.toBlock) {
                return false;
              }
              return true;
            });

            if (func) {
              return func.getVaultInfo(network, vaultAddress);
            }
          }

          return {
            target: new Contract(
              vaultAddress,
              ISingleSidedLPStrategyVaultABI,
              getProviderFromNetwork(network)
            ),
            method: 'getStrategyVaultInfo',
            key: vaultAddress,
            transform: (
              r: Awaited<
                ReturnType<ISingleSidedLPStrategyVault['getStrategyVaultInfo']>
              >
            ) => {
              const totalLPTokens = TokenBalance.toJSON(
                r.totalLPTokens,
                r.pool,
                network
              );

              const totalVaultShares = r.totalVaultShares;

              return {
                vaultAddress,
                pool: r.pool,
                singleSidedTokenIndex: r.singleSidedTokenIndex,
                totalLPTokens,
                totalVaultShares,
                secondaryTradeParams: '0x',
                enabled,
                name,
              };
            },
          };
        }
      );

    const { block, results } = await aggregate(
      calls || [],
      this.getProvider(network),
      blockNumber
    );

    const values = Object.keys(results).map((k) => {
      return [k, results[k] as VaultMetadata] as [string, VaultMetadata];
    });

    return {
      values,
      network: network,
      lastUpdateBlock: block.number,
      lastUpdateTimestamp: block.timestamp,
    };
  }
}
