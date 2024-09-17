import {
  ServerRegistry,
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from './server-registry';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  BalancerPoolABI,
  ERC20ABI,
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../token-balance';
import { DeprecatedVaults } from './vault-overrides';
import { ClientRegistry } from '../client/client-registry';
import { CacheSchema } from '..';

// NOTE: this is currently hardcoded because we cannot access the worker
// process environment directly here.
const NX_REGISTRY_URL = 'https://registry.notional.finance';

export class VaultRegistryServer extends ServerRegistry<VaultMetadata> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllVaultsDocument, AllVaultsByBlockDocument } =
      await loadGraphClientDeferred();

    let vaultConfigurations: {
      vaultAddress: string;
      enabled: boolean;
      name: string;
    }[];
    try {
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
      vaultConfigurations = data['data'].vaultConfigurations;
    } catch (e) {
      const response = await ClientRegistry.fetch<CacheSchema<VaultMetadata>>(
        `${NX_REGISTRY_URL}/${network}/vaults`
      );
      vaultConfigurations = response.values
        .filter(([_, p]) => p !== null)
        .map(([v, p]) => {
          return {
            vaultAddress: v,
            enabled: (p as VaultMetadata).enabled,
            name: (p as VaultMetadata).name,
          };
        });
    }

    const calls = vaultConfigurations
      .filter(
        (v: { vaultAddress: string }) =>
          !DeprecatedVaults.includes(v.vaultAddress) &&
          // NOTE: this is the address of the new pendle vault, exclude it from the registry server for now
          v.vaultAddress.toLowerCase() !==
            '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3'
      )
      .flatMap(
        ({
          vaultAddress,
          enabled,
          name,
        }: {
          vaultAddress: string;
          enabled: boolean;
          name: string;
        }) => {
          return [
            {
              target: new Contract(
                vaultAddress,
                ISingleSidedLPStrategyVaultABI,
                getProviderFromNetwork(network)
              ),
              stage: 0,
              method: 'getStrategyVaultInfo',
              key: vaultAddress,
              transform: (
                r: Awaited<
                  ReturnType<
                    ISingleSidedLPStrategyVault['getStrategyVaultInfo']
                  >
                >
              ) => {
                const totalLPTokens = TokenBalance.toJSON(
                  r.totalLPTokens,
                  r.pool,
                  network
                );

                const totalVaultShares = r.totalVaultShares;

                return {
                  pool: r.pool,
                  singleSidedTokenIndex: r.singleSidedTokenIndex,
                  maxPoolShares: r.maxPoolShare,
                  totalLPTokens,
                  totalVaultShares,
                  secondaryTradeParams: '0x',
                  enabled,
                  name,
                };
              },
            },
            {
              target: (r: any) =>
                new Contract(
                  r[vaultAddress].pool,
                  ERC20ABI,
                  getProviderFromNetwork(network)
                ),
              stage: 1,
              method: 'totalSupply',
              key: `${vaultAddress}.pool.totalSupply`,
              transform: (r: BigNumber, prevResults: any) =>
                TokenBalance.toJSON(r, prevResults[vaultAddress].pool, network),
            },
            {
              target: (r: any) =>
                new Contract(
                  r[vaultAddress].pool,
                  BalancerPoolABI,
                  getProviderFromNetwork(network)
                ),
              stage: 1,
              method: 'getActualSupply',
              key: `${vaultAddress}.pool.actualSupply`,
              transform: (r: BigNumber, prevResults: any) =>
                TokenBalance.toJSON(r, prevResults[vaultAddress].pool, network),
            },
          ];
        }
      );

    const { block, results } = await aggregate(
      calls || [],
      this.getProvider(network),
      blockNumber,
      true // allowFailure
    );

    const values = Object.keys(results)
      .filter((k) => !k.includes('.'))
      .map((k) => {
        const metadata = results[k] as VaultMetadata;
        if (results[`${k}.pool.actualSupply`]) {
          // This will exist for Balancer pools
          metadata['totalPoolSupply'] = results[`${k}.pool.actualSupply`] as
            | TokenBalance
            | undefined;
        } else {
          metadata['totalPoolSupply'] = results[`${k}.pool.totalSupply`] as
            | TokenBalance
            | undefined;
        }

        return [k, metadata] as [string, VaultMetadata];
      });

    return {
      values,
      network: network,
      lastUpdateBlock: block.number,
      lastUpdateTimestamp: block.timestamp,
    };
  }
}
