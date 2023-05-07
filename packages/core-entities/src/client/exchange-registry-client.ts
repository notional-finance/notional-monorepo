import { Network } from '@notional-finance/util';
import { map } from 'rxjs';
import { PoolClasses, PoolConstructor } from '../exchanges';
import { PoolDefinition } from '..';
import { ClientRegistry } from '../registry/client-registry';

export class ExchangeRegistryClient extends ClientRegistry<PoolDefinition> {
  protected cachePath = 'exchanges';

  public subscribePoolInstance(network: Network, address: string) {
    return this.subscribeSubject(network, address)?.pipe(
      map((pool) => this._buildPool(network, pool))
    );
  }

  public getPoolInstance(network: Network, address: string) {
    const pool = this.getLatestFromSubject(network, address);
    return this._buildPool(network, pool);
  }

  private _buildPool(
    network: Network,
    pool: PoolDefinition | null | undefined
  ) {
    if (pool && pool.latestPoolData) {
      const PoolClass = PoolClasses[pool.PoolClass] as PoolConstructor;

      return new PoolClass(
        network,
        pool.latestPoolData.balances,
        pool.latestPoolData.totalSupply,
        pool.latestPoolData.poolParams
      );
    }

    return null;
  }
}
