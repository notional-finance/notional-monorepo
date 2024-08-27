import {
  BaseLiquidityPool,
  fCashMarket,
  pCashMarket,
  PoolClasses,
  PoolConstructor,
  SNOTEWeightedPool,
} from '../../exchanges/index';
import { Network } from '@notional-finance/util';
import { NetworkModelType } from '../NetworkModel';
import { ethers } from 'ethers';
import { TokenBalance } from '../../token-balance';

export const ExchangeViews = (self: NetworkModelType) => {
  const getPoolInstance = <T extends BaseLiquidityPool<unknown>>(
    address: string
  ) => {
    const poolDefinition =
      self.exchanges.get(ethers.utils.getAddress(address)) ||
      self.exchanges.get(address.toLowerCase());
    if (!poolDefinition)
      throw Error(`Pool ${address} on ${self.network} not found`);
    if (!poolDefinition.latestPoolData)
      throw Error(`Pool data not defined for ${poolDefinition}`);
    const PoolClass = PoolClasses[poolDefinition.PoolClass] as PoolConstructor;

    return new PoolClass(
      self.network,
      poolDefinition.latestPoolData.balances,
      poolDefinition.latestPoolData.totalSupply,
      poolDefinition.latestPoolData.poolParams
    ) as T;
  };

  const getSNOTEPool = () => {
    return self.network === Network.mainnet
      ? getPoolInstance<SNOTEWeightedPool>(SNOTEWeightedPool.sNOTE_Pool)
      : undefined;
  };

  const getfCashMarket = (currencyId: number) => {
    const nToken = self.getNToken(currencyId);
    return nToken ? getPoolInstance<fCashMarket>(nToken.address) : undefined;
  };

  const getNotionalMarket = (currencyId: number) => {
    const nToken = self.getNToken(currencyId);
    if (nToken) return getfCashMarket(currencyId);

    const pCash = self.getPrimeCash(currencyId);
    const config = self.getConfig(currencyId);

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
