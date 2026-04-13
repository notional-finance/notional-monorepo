import {
  BaseLiquidityPool,
  PoolClasses,
  PoolConstructor,
  SNOTEWeightedPool,
} from '../../exchanges/index';
import { LendingMarket } from '../../exchanges';
import { Network } from '@notional-finance/util';
import { NetworkModel } from '../NetworkModel';
import { ethers } from 'ethers';
import { Instance } from 'mobx-state-tree';
import { reviver } from '../../client';
import { TokenDefinition } from '../../Definitions';
import { decodeMorphoLendingRouterParams } from './ConfigurationViews';

export function getPoolInstance_<T extends BaseLiquidityPool<unknown>>(
  self: Instance<typeof NetworkModel>,
  address: string
) {
  const poolDefinition =
    self.exchanges.get(address.toLowerCase()) ||
    self.exchanges.get(ethers.utils.getAddress(address));
  if (!poolDefinition)
    throw Error(`Pool ${address} on ${self.network} not found`);
  if (!poolDefinition.latestPoolData)
    throw Error(`Pool data not defined for ${poolDefinition}`);
  const PoolClass = PoolClasses[poolDefinition.PoolClass] as PoolConstructor;
  if (PoolClass === undefined) {
    throw Error(`Pool class ${poolDefinition.PoolClass} not found`);
  }
  const poolParams = JSON.parse(
    poolDefinition.latestPoolData.poolParams,
    reviver
  );

  return new PoolClass(
    self.network,
    poolDefinition.latestPoolData.balances,
    poolDefinition.latestPoolData.totalSupply,
    poolParams
  ) as T;
}

export const ExchangeViews = (self: Instance<typeof NetworkModel>) => {
  const getPoolInstance = <T extends BaseLiquidityPool<unknown>>(
    address: string
  ) => {
    return getPoolInstance_<T>(self, address);
  };

  const getSNOTEPool = () => {
    return self.network === Network.mainnet
      ? getPoolInstance<SNOTEWeightedPool>(SNOTEWeightedPool.sNOTE_Pool)
      : undefined;
  };

  const getLendingMarket = (vault: string, lendingRouter: string) => {
    const lr = self.configuration?.lendingRouters.find(
      (lr) => lr.id === lendingRouter
    );
    const m = lr?.markets.find((m) => m.vault === vault);

    if (lr?.name === 'Morpho' && m) {
      const marketParams = decodeMorphoLendingRouterParams(m.params);
      return getPoolInstance<LendingMarket>(marketParams.marketId);
    } else {
      throw Error(`Market params for ${vault} on ${lendingRouter} not found`);
    }
  };

  const getMorphoMarketParams = (vault: string, lendingRouter: string) => {
    const lr = self.configuration?.lendingRouters.find(
      (lr) => lr.id === lendingRouter
    );
    const m = lr?.markets.find((m) => m.vault === vault);
    if (lr?.name === 'Morpho' && m) {
      return decodeMorphoLendingRouterParams(m.params);
    } else {
      throw Error(`Market params for ${vault} on ${lendingRouter} not found`);
    }
  };

  const getLendingMarketFromVaultDebt = (vaultDebt: TokenDefinition) => {
    if (!vaultDebt.vaultAddress)
      throw Error('Vault debt token has no vault address');
    return getLendingMarket(vaultDebt.vaultAddress, vaultDebt.address);
  };

  const getMorphoMarketId = (vaultDebt?: TokenDefinition) => {
    if (!vaultDebt) return undefined;
    const lendingRouter = vaultDebt.address;
    const lr = self.configuration?.lendingRouters.find(
      (lr) => lr.id === lendingRouter
    );
    const m = lr?.markets.find((m) => m.vault === vaultDebt.vaultAddress);

    if (lr?.name === 'Morpho' && m) {
      const marketParams = decodeMorphoLendingRouterParams(m.params);
      return marketParams.marketId;
    } else {
      return undefined;
    }
  };

  return {
    getPoolInstance,
    getLendingMarket,
    getSNOTEPool,
    getLendingMarketFromVaultDebt,
    getMorphoMarketId,
    getMorphoMarketParams,
  };
};
