import { ethers } from 'ethers';
import { BehaviorSubject, map } from 'rxjs';
import { Network, TokenBalance } from '..';
import { BaseCachable } from '../common/BaseCachable';
import BaseLiquidityPool from './BaseLiquidityPool';
import defaultPools from './DefaultPools';

interface PoolData {
  balances: TokenBalance[];
  totalSupply: TokenBalance;
  poolParams: Record<string, unknown>;
}

type PoolConstructor = new (
  balances: TokenBalance[],
  totalSupply: TokenBalance,
  poolParams: unknown
) => BaseLiquidityPool<unknown>;

export class ExchangeRegistry extends BaseCachable {
  protected static pools = defaultPools;

  protected static poolDataSubjects = new Map<
    Network,
    Map<string, BehaviorSubject<PoolData | undefined>>
  >();

  public static async registerPool(
    network: Network,
    poolAddress: string,
    poolClass: typeof BaseLiquidityPool
  ) {
    const networkPools =
      this.pools.get(network) || new Map<string, typeof BaseLiquidityPool>();
    networkPools.set(poolAddress, poolClass);
    this.pools.set(network, networkPools);

    const networkSubjects =
      this.poolDataSubjects.get(network) ||
      new Map<string, BehaviorSubject<PoolData | undefined>>();
    networkSubjects.set(
      poolAddress,
      new BehaviorSubject<PoolData | undefined>(undefined)
    );
    this.poolDataSubjects.set(network, networkSubjects);
  }

  public static async fetchPoolData(
    network: Network,
    provider: ethers.providers.Provider
  ) {
    // Loop over all pools and fetch its init data and put it into an observable
    const pools = defaultPools.get(network);
    if (!pools) throw Error(`No pools found for network ${network}`);
    const aggregateCall = Array.from(pools.entries()).flatMap(
      ([poolAddress, PoolClass]) =>
        PoolClass.getInitData(network, poolAddress).map((c) =>
          // Prepend the pool address to the call data
          Object.assign(c, { key: `${poolAddress}.${c.key}` })
        )
    );

    const { results } = await this.fetchLatest(
      network,
      aggregateCall,
      provider
    );

    const updateSubjects = this.poolDataSubjects.get(network);
    if (!updateSubjects)
      throw Error(`Exchange update subjects not found for ${network}`);

    // Remap results into a per pool PoolData
    const allPoolData = Object.keys(results)
      .map((k) => k.split('.', 2))
      .reduce((allData, [poolAddress, key]) => {
        const poolData =
          allData.get(poolAddress) || ({ poolParams: {} } as PoolData);
        if (key === 'balances') {
          poolData.balances = results[
            `${poolAddress}.balances`
          ] as TokenBalance[];
        } else if (key === 'totalSupply') {
          poolData.totalSupply = results[
            `${poolAddress}.totalSupply`
          ] as TokenBalance;
        } else {
          poolData.poolParams[key] = results[`${poolAddress}.${key}`];
        }

        allData.set(poolAddress, poolData);
        return allData;
      }, new Map<string, PoolData>());

    // Calls next() on all the pool update subjects
    Array.from(allPoolData.keys()).forEach((k) => {
      const data = allPoolData.get(k);
      if (data) updateSubjects.get(k)?.next(data);
    });
  }

  public static getPoolInstance(network: Network, poolAddress: string) {
    const poolData = this.poolDataSubjects
      .get(network)
      ?.get(poolAddress)?.value;

    const PoolClass = this.pools.get(network)?.get(poolAddress) as
      | PoolConstructor
      | undefined;
    if (!poolData || !PoolClass) return undefined;

    return new PoolClass(
      poolData.balances,
      poolData.totalSupply,
      poolData.poolParams
    );
  }

  public static subscribePoolInstance(network: Network, poolAddress: string) {
    const poolDataObservable = this.poolDataSubjects
      .get(network)
      ?.get(poolAddress)
      ?.asObservable();

    const PoolClass = this.pools.get(network)?.get(poolAddress) as
      | PoolConstructor
      | undefined;
    if (!poolDataObservable || !PoolClass) return undefined;

    return poolDataObservable.pipe(
      map((p) =>
        p ? new PoolClass(p.balances, p.totalSupply, p.poolParams) : undefined
      )
    );
  }
}
