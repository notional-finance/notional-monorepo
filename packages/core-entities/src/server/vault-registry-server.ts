import {
  ServerRegistry,
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from './server-registry';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  ERC20ABI,
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { BigNumber, Contract } from 'ethers';
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
            },
            {
              target: (r: any) =>
                new Contract(
                  r[vaultAddress].pool,
                  ERC20ABI,
                  getProviderFromNetwork(network)
                ),
              stage: 1,
              method: 'getActualSupply',
              key: `${vaultAddress}.pool.actualSupply`,
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
            | BigNumber
            | undefined;
        } else {
          metadata['totalPoolSupply'] = results[`${k}.pool.totalSupply`] as
            | BigNumber
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
