import {
  BaseLiquidityPool,
  fCashMarket,
  pCashMarket,
  PoolClasses,
  PoolConstructor,
  SNOTEWeightedPool,
} from '../../exchanges/index';
import { Network } from '@notional-finance/util';
import { NetworkModel } from '../NetworkModel';
import { ethers } from 'ethers';
import { TokenBalance } from '../../token-balance';
import { ClientRegistry } from '../../client/client-registry';
import { Instance } from 'mobx-state-tree';
import { TokenViews } from './TokenViews';

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
  const poolParams = JSON.parse(
    poolDefinition.latestPoolData.poolParams,
    ClientRegistry.reviver
  );

  return new PoolClass(
    self.network,
    poolDefinition.latestPoolData.balances,
    poolDefinition.latestPoolData.totalSupply,
    poolParams
  ) as T;
}

export const ExchangeViews = (self: Instance<typeof NetworkModel>) => {
  const { getNToken, getPrimeCash } = TokenViews(self);

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

  const getfCashMarket = (currencyId: number) => {
    const nToken = getNToken(currencyId);
    return getPoolInstance<fCashMarket>(nToken.address);
  };

  const getNotionalMarket = (currencyId: number) => {
    try {
      // If there is an nToken, return the fCash market
      if (getNToken(currencyId)) return getfCashMarket(currencyId);
    } catch (e) {
      // getNToken throws an error if the nToken is not found, but just swallow it
      // and return the pCash market
    }

    const pCash = getPrimeCash(currencyId);
    const config = self.configuration?.currencyConfigurations.find(
      (c) => c.id === `${currencyId}`
    );

    if (!pCash || !config?.primeCashCurve)
      throw Error('Prime Cash Curve not found');
    return new pCashMarket(
      self.network,
      [pCash.totalSupply || TokenBalance.zero(pCash)],
      pCash.totalSupply || TokenBalance.zero(pCash),
      {
        currencyId,
        primeCashCurve: config.primeCashCurve,
      }
    );
  };

  return {
    getPoolInstance,
    getSNOTEPool,
    getfCashMarket,
    getNotionalMarket,
  };
};
