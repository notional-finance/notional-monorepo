import { filterEmpty, Network } from '@notional-finance/util';
import { map } from 'rxjs';
import { BaseLiquidityPool, PoolClasses, PoolConstructor } from '../exchanges';
import { PoolDefinition } from '..';
import { ClientRegistry } from './client-registry';
import { Routes } from '../server';
import { ethers } from 'ethers';
import { vaultPool } from '../exchanges/vault-pool';

export class ExchangeRegistryClient extends ClientRegistry<PoolDefinition> {
  protected cachePath() {
    return Routes.Exchanges;
  }

  public subscribePoolForVault(network: Network, vaultAddress: string) {
    const { address: poolAddress } = vaultPool[network][vaultAddress];
    return poolAddress !== undefined
      ? this.subscribePoolInstance(network, poolAddress)
      : undefined;
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
