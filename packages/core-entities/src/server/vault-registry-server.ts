import { ServerRegistry, loadGraphClientDeferred } from './server-registry';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  Curve2TokenConvexVault,
  Curve2TokenConvexVaultABI,
} from '@notional-finance/contracts';
import { Contract } from 'ethers';
import { TokenBalance } from '../token-balance';

export class VaultRegistryServer extends ServerRegistry<VaultMetadata> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllVaultsDocument, AllVaultsByBlockDocument, execute } =
      await loadGraphClientDeferred();
    const data = await execute(
      blockNumber !== undefined ? AllVaultsByBlockDocument : AllVaultsDocument,
      { blockNumber },
      { chainName: network }
    );

    const calls = data['data'].vaultConfigurations.map(
      ({ vaultAddress }: { vaultAddress: string }) => {
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

            const totalVaultShares =
              r.baseStrategy.vaultState.totalVaultSharesGlobal;

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
