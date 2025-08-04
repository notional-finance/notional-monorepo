import {
  BaseLiquidityPool,
  PoolClasses,
  PoolConstructor,
  SNOTEWeightedPool,
} from '../../exchanges/index';
import { Network } from '@notional-finance/util';
import { NetworkModel } from '../NetworkModel';
import { ethers } from 'ethers';
import { Instance } from 'mobx-state-tree';
import { reviver } from '../../client';

export function getPoolInstance_<T extends BaseLiquidityPool<unknown>>(
  self: Instance<typeof NetworkModel>,
  address: string
) {
  const poolDefinition =
    self.exchanges.get(ethers.utils.getAddress(address)) ||
    self.exchanges.get(address.toLowerCase());
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

  return {
    getPoolInstance,
    getSNOTEPool,
  };
};
