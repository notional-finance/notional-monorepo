import { filterEmpty, Network } from '@notional-finance/util';
import { map } from 'rxjs';
import { BaseLiquidityPool, PoolClasses, PoolConstructor } from '../exchanges';
import { PoolDefinition } from '..';
import { ClientRegistry } from './client-registry';
import { Routes } from '../server';

export class ExchangeRegistryClient extends ClientRegistry<PoolDefinition> {
  protected cachePath() {
    return Routes.Exchanges;
  }

  public subscribePoolInstance<T extends BaseLiquidityPool<unknown>>(
    network: Network,
    address: string
  ) {
    return this.subscribeSubject(network, address)?.pipe(
      filterEmpty(),
      map((pool) => this._buildPool<T>(network, pool))
    );
  }

  public getPoolInstance<T extends BaseLiquidityPool<unknown>>(
    network: Network,
    address: string
  ) {
    const pool = this.getLatestFromSubject(network, address);
    if (!pool) throw Error(`Pool ${address} on ${network} not found`);
    return this._buildPool<T>(network, pool);
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
