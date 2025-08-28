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
import { ERC20ABI } from '@notional-finance/contracts';
import { BigNumber, Contract, ethers } from 'ethers';
import { TokenBalance } from '../token-balance';
import { CacheSchema, fetchFromRegistry } from '..';
import { BaseVaultParams } from '../vaults/VaultAdapter';

// NOTE: this is currently hardcoded because we cannot access the worker
// process environment directly here.
const NX_REGISTRY_URL = 'https://registry.notional.finance';

const PendlePTVaultABI = new ethers.utils.Interface([
  'function MARKET() view external returns (address)',
  'function TOKEN_IN_SY() view external returns (address)',
  'function TOKEN_OUT_SY() view external returns (address)',
]);

const PendleMarketABI = new ethers.utils.Interface([
  'function expiry() view external returns (uint256)',
]);

const CurveConvex2Token = new ethers.utils.Interface([
  'function CURVE_POOL_TOKEN() view external returns (address)',
  'function PRIMARY_INDEX() view external returns (uint8)',
  'function maxPoolShare() view external returns (uint256)',
  'function totalSupply() view external returns (uint256)',
  // TODO: get this from the abi
  'function getRewardSettings() view external returns (uint256[])',
]);

export class VaultRegistryServer extends ServerRegistry<VaultMetadata> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllVaultsDocument } = await loadGraphClientDeferred();

    let vaultConfigurations: BaseVaultParams[];
    try {
      const data = await fetchGraphPaginate(
        network,
        AllVaultsDocument,
        'vaults',
        this.env.NX_SUBGRAPH_API_KEY
      );
      vaultConfigurations = data['data'].vaults.map((v) => ({
        vaultAddress: v.id,
        yieldToken: v.yieldToken.id,
        strategyType: v.strategyType,
        enabled: v.isWhitelisted,
      }));
    } catch (e) {
      const response = await fetchFromRegistry<CacheSchema<VaultMetadata>>(
        `${network}/vaults`,
        NX_REGISTRY_URL
      );
      vaultConfigurations = response.values
        .filter(([_, p]) => p !== null)
        .map(([v, p]) => {
          return {
            vaultAddress: v,
            yieldToken: (p as { yieldToken: string }).yieldToken,
            strategyType: (p as { strategyType: string }).strategyType,
            enabled: (p as { enabled: boolean }).enabled,
          };
        });
    }

    const calls = vaultConfigurations.flatMap(
      ({
        vaultAddress,
        enabled,
        strategyType,
        yieldToken,
      }: {
        vaultAddress: string;
        enabled: boolean;
        strategyType: string;
        yieldToken: string;
      }) => {
        let calls: AggregateCall[] = [];
        switch (strategyType) {
          case 'CurveConvex2Token':
            calls = this.getCurveConvex2TokenCalls(vaultAddress, network);
            break;
          case 'PendlePT':
            calls = this.getPendlePTCalls(vaultAddress, network, enabled);
            break;
          case 'Staking':
            calls = this.getStakingCalls(vaultAddress, enabled);
            break;
          default:
            calls = [];
        }
        calls.push(
          {
            target: 'NO_OP',
            stage: 0,
            method: 'NO_OP',
            key: vaultAddress,
            transform: () => ({ vaultAddress }),
          },
          {
            target: 'NO_OP',
            stage: 0,
            method: 'NO_OP',
            key: `${vaultAddress}.yieldToken`,
            transform: () => yieldToken,
          },
          {
            target: 'NO_OP',
            stage: 0,
            method: 'NO_OP',
            key: `${vaultAddress}.strategyType`,
            transform: () => strategyType,
          }
        );

        return calls;
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

  protected getCurveConvex2TokenCalls(
    vaultAddress: string,
    network: Network
  ): AggregateCall[] {
    const vaultContract = new Contract(
      vaultAddress,
      CurveConvex2Token,
      getProviderFromNetwork(network)
    );
    const calls: AggregateCall[] = [
      {
        target: vaultContract,
        stage: 0,
        method: 'CURVE_POOL_TOKEN',
        key: `${vaultAddress}.pool`,
      },
      {
        target: 'NO_OP',
        stage: 0,
        method: 'NO_OP',
        key: `${vaultAddress}.enabled`,
        transform: () => true,
      },
      {
        target: vaultContract,
        stage: 0,
        method: 'PRIMARY_INDEX',
        key: `${vaultAddress}.singleSidedTokenIndex`,
      },
      {
        stage: 0,
        target: vaultContract,
        method: 'maxPoolShare',
        key: `${vaultAddress}.maxPoolShares`,
      },
      {
        target: vaultContract,
        stage: 0,
        method: 'totalSupply',
        key: `${vaultAddress}.totalVaultShares`,
      },
      {
        stage: 1,
        target: (r: Record<string, unknown>) =>
          new Contract(
            r[`${vaultAddress}.pool`] as string,
            ERC20ABI,
            getProviderFromNetwork(network)
          ),
        method: 'totalSupply',
        key: `${vaultAddress}.totalPoolSupply`,
        transform: (r: BigNumber, prevResults: Record<string, unknown>) =>
          TokenBalance.toJSON(
            r,
            prevResults[`${vaultAddress}.pool`] as string,
            network
          ),
      },
      {
        stage: 1,
        target: (r: Record<string, unknown>) =>
          new Contract(
            r[`${vaultAddress}.yieldToken`] as string,
            ERC20ABI,
            getProviderFromNetwork(network)
          ),
        method: 'balanceOf',
        args: [vaultAddress],
        key: `${vaultAddress}.totalLPTokens`,
        transform: (r: BigNumber, prevResults: Record<string, unknown>) =>
          TokenBalance.toJSON(
            r,
            prevResults[`${vaultAddress}.yieldToken`] as string,
            network
          ),
      },
      {
        target: vaultContract,
        stage: 0,
        method: 'getRewardSettings',
        key: `${vaultAddress}.rewardState`,
        // TODO: fix this
        // transform: (r: BigNumber[]) =>
        //   r[0].map((v) => ({
        //     lastAccumulatedTime: v.lastAccumulatedTime,
        //     endTime: v.endTime,
        //     rewardToken: v.rewardToken,
        //     emissionRatePerYear: v.emissionRatePerYear,
        //     accumulatedRewardPerVaultShare: v.accumulatedRewardPerVaultShare,
        //   })),
      },
    ];

    return calls;
  }

  protected getPendlePTCalls(
    vaultAddress: string,
    network: Network,
    enabled: boolean
  ): AggregateCall[] {
    return [
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

  protected getStakingCalls(
    vaultAddress: string,
    enabled: boolean
  ): AggregateCall[] {
    return [
      {
        target: 'NO_OP',
        stage: 0,
        method: 'NO_OP',
        key: `${vaultAddress}.enabled`,
        transform: () => enabled,
      },
    ];
  }
}
