import { filterEmpty, Network } from '@notional-finance/util';
import { map } from 'rxjs';
import {
  BaseLiquidityPool,
  fCashMarket,
  PoolClasses,
  PoolConstructor,
} from '../exchanges';
import { PoolDefinition, Registry } from '..';
import { ClientRegistry } from './client-registry';
import { Routes } from '../server';
import { ethers } from 'ethers';

export class ExchangeRegistryClient extends ClientRegistry<PoolDefinition> {
  protected cachePath() {
    return Routes.Exchanges;
  }

  public subscribePoolInstance<T extends BaseLiquidityPool<unknown>>(
    network: Network,
    address: string
  ) {
    return this.subscribeSubject(
      network,
      // Converts to a checksummed address
      ethers.utils.getAddress(address)
    )?.pipe(
      filterEmpty(),
      map((pool) => this._buildPool<T>(network, pool))
    );
  }

  public getPoolInstance<T extends BaseLiquidityPool<unknown>>(
    network: Network,
    address: string
  ) {
    const pool = this.getLatestFromSubject(
      network,
      // Converts to a checksummed address
      ethers.utils.getAddress(address)
    );
    if (!pool) throw Error(`Pool ${address} on ${network} not found`);
    return this._buildPool<T>(network, pool);
  }

  public getfCashMarket(network: Network, currencyId: number) {
    const nToken = Registry.getTokenRegistry().getNToken(network, currencyId);
    return this.getPoolInstance<fCashMarket>(network, nToken.address);
  }

  private _buildPool<T>(network: Network, pool: PoolDefinition) {
    if (!pool.latestPoolData) throw Error(`Pool data not defined for ${pool}`);
    const PoolClass = PoolClasses[pool.PoolClass] as PoolConstructor;

    return new PoolClass(
      network,
      pool.latestPoolData.balances,
      pool.latestPoolData.totalSupply,
      pool.latestPoolData.poolParams
    ) as T;
  }
}
