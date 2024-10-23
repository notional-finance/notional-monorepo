import {
  ServerRegistry,
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from './server-registry';
import {
  Network,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  BalancerPoolABI,
  ERC20ABI,
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { BigNumber, Contract, ethers } from 'ethers';
import { TokenBalance } from '../token-balance';
import { DeprecatedVaults } from './vault-overrides';
import { ClientRegistry } from '../client/client-registry';
import { CacheSchema, ConfigurationClient, getVaultType } from '..';

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
            enabled: (p as { enabled: boolean }).enabled,
            name: (p as { name: string }).name,
          };
        });
    }

    const calls = vaultConfigurations
      .filter(
        (v: { vaultAddress: string; name: string }) =>
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
          const vaultType = getVaultType(vaultAddress, network);
          switch (vaultType) {
            case 'SingleSidedLP_AutoReinvest':
            case 'SingleSidedLP_DirectClaim':
            case 'SingleSidedLP_Points':
              return this.getSingleSidedLPCalls(
                vaultAddress,
                network,
                enabled,
                name,
                vaultType === 'SingleSidedLP_DirectClaim'
              );
            case 'PendlePT':
              return this.getPendlePTCalls(
                vaultAddress,
                network,
                enabled,
                name
              );
            default:
              return [];
          }
        }
      );

    const { block, results } = await aggregate(
      calls,
      this.getProvider(network),
      blockNumber,
      true // allowFailure
    );

    const values = Object.keys(results).reduce((acc, k) => {
      let vaultAddress: string;
      let metadataKey: string | undefined = undefined;
      if (k.includes('.')) {
        [vaultAddress, metadataKey] = k.split('.');
      } else {
        vaultAddress = k;
      }

      if (acc[vaultAddress] === undefined) {
        acc[vaultAddress] = {};
      }

      if (metadataKey) {
        acc[vaultAddress][metadataKey] = results[k];
      } else {
        acc[vaultAddress] = {
          ...acc[vaultAddress],
          ...(results[k] as Record<string, unknown>),
        };
      }

      return acc;
    }, {} as Record<string, Record<string, unknown>>);

    return {
      values: Object.entries(values).map(
        ([vaultAddress, metadata]) =>
          [vaultAddress, metadata as unknown as VaultMetadata] as [
            string,
            VaultMetadata
          ]
      ),
      network: network,
      lastUpdateBlock: block.number,
      lastUpdateTimestamp: block.timestamp,
    };
  }

  protected getSingleSidedLPCalls(
    vaultAddress: string,
    network: Network,
    enabled: boolean,
    name: string,
    hasRewarder: boolean
  ): AggregateCall[] {
    const vaultContract = new Contract(
      vaultAddress,
      ISingleSidedLPStrategyVaultABI,
      getProviderFromNetwork(network)
    );
    const calls: AggregateCall[] = [
      {
        target: vaultContract,
        stage: 0,
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
            pool: r.pool,
            singleSidedTokenIndex: r.singleSidedTokenIndex,
            maxPoolShares: r.maxPoolShare,
            totalLPTokens,
            totalVaultShares,
            secondaryTradeParams: '0x',
            enabled,
            vaultAddress,
            rewardState: undefined,
            ...ConfigurationClient.parseVaultName(name),
          };
        },
      },
      {
        target: (r: Record<string, unknown>) =>
          new Contract(
            (r[vaultAddress] as { pool: string }).pool,
            ERC20ABI,
            getProviderFromNetwork(network)
          ),
        stage: 1,
        method: 'totalSupply',
        key: `${vaultAddress}.totalPoolSupply`,
        transform: (r: BigNumber, prevResults: Record<string, unknown>) =>
          TokenBalance.toJSON(
            r,
            (prevResults[vaultAddress] as { pool: string }).pool,
            network
          ),
      },
      {
        target: (r: Record<string, unknown>) =>
          new Contract(
            (r[vaultAddress] as { pool: string }).pool,
            BalancerPoolABI,
            getProviderFromNetwork(network)
          ),
        stage: 1,
        method: 'getActualSupply',
        key: `${vaultAddress}.totalPoolSupply`,
        transform: (r: BigNumber, prevResults: Record<string, unknown>) =>
          TokenBalance.toJSON(
            r,
            (prevResults[vaultAddress] as { pool: string }).pool,
            network
          ),
      },
    ];

    if (hasRewarder) {
      calls.push({
        target: vaultContract,
        stage: 0,
        method: 'getRewardSettings',
        key: `${vaultAddress}.rewardState`,
        transform: (
          r: Awaited<
            ReturnType<ISingleSidedLPStrategyVault['getRewardSettings']>
          >
        ) =>
          r[0].map((v) => ({
            lastAccumulatedTime: v.lastAccumulatedTime,
            endTime: v.endTime,
            rewardToken: v.rewardToken,
            emissionRatePerYear: v.emissionRatePerYear,
            accumulatedRewardPerVaultShare: v.accumulatedRewardPerVaultShare,
          })),
      });
    }

    return calls;
  }

  protected getPendlePTCalls(
    vaultAddress: string,
    network: Network,
    enabled: boolean,
    name: string
  ): AggregateCall[] {
    const PendlePTVaultABI = new ethers.utils.Interface([
      'function MARKET() view external returns (address)',
      'function TOKEN_IN_SY() view external returns (address)',
      'function TOKEN_OUT_SY() view external returns (address)',
    ]);

    const PendleMarketABI = new ethers.utils.Interface([
      'function expiry() view external returns (uint256)',
    ]);

    return [
      {
        target: 'NO_OP',
        stage: 0,
        method: 'NO_OP',
        key: vaultAddress,
        transform: () => ({
          ...ConfigurationClient.parseVaultName(name),
          vaultAddress,
        }),
      },
      {
        target: new Contract(
          vaultAddress,
          PendlePTVaultABI,
          getProviderFromNetwork(network)
        ),
        stage: 0,
        method: 'MARKET',
        key: `${vaultAddress}.marketAddress`,
      },
      {
        target: new Contract(
          vaultAddress,
          PendlePTVaultABI,
          getProviderFromNetwork(network)
        ),
        stage: 0,
        method: 'TOKEN_IN_SY',
        key: `${vaultAddress}.tokenInSy`,
      },
      {
        target: new Contract(
          vaultAddress,
          PendlePTVaultABI,
          getProviderFromNetwork(network)
        ),
        stage: 0,
        method: 'TOKEN_OUT_SY',
        key: `${vaultAddress}.tokenOutSy`,
      },
      {
        target: (r: Record<string, unknown>) =>
          new Contract(
            r[`${vaultAddress}.marketAddress`] as string,
            PendleMarketABI,
            getProviderFromNetwork(network)
          ),
        stage: 1,
        method: 'expiry',
        key: `${vaultAddress}.enabled`,
        transform: (expiry: BigNumber) =>
          enabled ? expiry.gt(getNowSeconds()) : false,
      },
    ];
  }
}
