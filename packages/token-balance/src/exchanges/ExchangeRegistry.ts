import { Network } from '@notional-finance/token-balance';
import { ethers } from 'ethers';
import { AbstractLiquidityPool } from './exchanges/AbstractLiquidityPool';

export class ExchangeRegistry {
  protected static pools = new Map<
    Network,
    Map<string, typeof AbstractLiquidityPool>
  >();

  public static async registerPool(
    network: Network,
    poolAddress: string,
    poolClass: typeof AbstractLiquidityPool
  ) {
    const networkPool =
      this.pools.get(network) ||
      new Map<string, typeof AbstractLiquidityPool>();
    networkPool.set(poolAddress, poolClass);
    this.pools.set(network, networkPool);
  }

  public static fetchPoolData(network: Network) {
    // Loop over all pools and fetch its init data and put it into an observable
  }

  public static getPoolInstance(network: Network, poolAddress: string) {}

  public static subscribePoolInstance(network: Network, poolAddress: string) {}
}
