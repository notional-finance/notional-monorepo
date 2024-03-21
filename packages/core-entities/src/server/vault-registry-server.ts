import { ServerRegistry, loadGraphClientDeferred } from './server-registry';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { aggregate } from '@notional-finance/multicall';
import { VaultMetadata } from '../vaults';
import {
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { Contract } from 'ethers';
import { TokenBalance } from '../token-balance';
import { vaultOverrides } from './vault-overrides';

export class VaultRegistryServer extends ServerRegistry<VaultMetadata> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllVaultsDocument, AllVaultsByBlockDocument, execute } =
      await loadGraphClientDeferred();
    const data = await execute(
      blockNumber !== undefined ? AllVaultsByBlockDocument : AllVaultsDocument,
      { blockNumber },
      { chainName: network }
    );

    const calls = data['data'].vaultConfigurations
      .filter(
        (v: { vaultAddress: string }) =>
          // These are deprecated vaults with old method signatures
          v.vaultAddress !== '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa' &&
          v.vaultAddress !== '0xb9bdaa34ea52c3e2f3ec39fcd8146887e6b1c78c' &&
          v.vaultAddress !== '0xb6efe4f505248846465f944801e299c14269126b'
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
