import { ServerRegistry, loadGraphClientDeferred } from './server-registry';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  Curve2TokenConvexVault,
  Curve2TokenConvexVaultABI,
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { Contract } from 'ethers';
import { TokenBalance } from '../token-balance';

function getCurveVaultInfo(network: Network, vaultAddress: string) {
  return {
    target: new Contract(
      vaultAddress,
      Curve2TokenConvexVaultABI,
      getProviderFromNetwork(network)
    ),
    method: 'getStrategyContext',
    key: vaultAddress,
    transform: (
      r: Awaited<ReturnType<Curve2TokenConvexVault['getStrategyContext']>>
    ) => {
      const totalLPTokens = TokenBalance.toJSON(
        r.baseStrategy.vaultState.totalPoolClaim,
        r.poolContext.basePool.poolToken,
        network
      );
      const totalVaultShares = r.baseStrategy.vaultState.totalVaultSharesGlobal;
      return {
        pool: r.poolContext.curvePool,
        singleSidedTokenIndex: r.poolContext.basePool.primaryIndex,
        totalLPTokens,
        totalVaultShares,
        secondaryTradeParams: '0x',
      };
    },
  };
}

interface VaultInfoOverride {
  fromBlock?: number;
  toBlock?: number;
  getVaultInfo: (network: Network, vaultAddress: string) => unknown;
}

const vaultOverrides: Record<string, VaultInfoOverride[]> = {
  '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa': [
    {
      getVaultInfo: getCurveVaultInfo,
    },
  ],
  '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf': [
    {
      getVaultInfo: getCurveVaultInfo,
    },
  ],
};

export class VaultRegistryServer extends ServerRegistry<VaultMetadata> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllVaultsDocument, AllVaultsByBlockDocument, execute } =
      await loadGraphClientDeferred();
    const data = await execute(
      blockNumber !== undefined ? AllVaultsByBlockDocument : AllVaultsDocument,
      { blockNumber },
      { chainName: network }
    );

    console.log(JSON.stringify(data));

    const calls = data['data'].vaultConfigurations.map(
      ({ vaultAddress }: { vaultAddress: string }) => {
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
              pool: r.pool,
              singleSidedTokenIndex: r.singleSidedTokenIndex,
              totalLPTokens,
              totalVaultShares,
              secondaryTradeParams: '0x',
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
