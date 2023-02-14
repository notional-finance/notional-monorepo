import { ethers } from 'ethers';
import { BehaviorSubject, map } from 'rxjs';
import {
  Network,
  PoolDefinition,
  TokenBalance,
  TokenDefinition,
  TokenRegistry,
} from '..';
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

interface NetworkPools {
  poolClass: Map<string, typeof BaseLiquidityPool<unknown>>;
  poolData: Map<string, BehaviorSubject<PoolData | undefined>>;
  poolToken: Map<string, TokenDefinition>;
}

export class ExchangeRegistry extends BaseCachable {
  protected static pools = new Map<Network, NetworkPools>(
    defaultPools.map(([n, _pools]) => {
      const poolClass = new Map<string, typeof BaseLiquidityPool<unknown>>();
      const poolData = new Map<string, BehaviorSubject<PoolData | undefined>>();
      const poolToken = new Map<string, TokenDefinition>();

      _pools.forEach((poolDef) =>
        this.addPool(poolDef, poolClass, poolData, poolToken)
      );

      return [n, { poolClass, poolData, poolToken }];
    })
  );

  protected static addPool(
    poolDef: PoolDefinition,
    poolClass: Map<string, typeof BaseLiquidityPool<unknown>>,
    poolData: Map<string, BehaviorSubject<PoolData | undefined>>,
    poolToken: Map<string, TokenDefinition>
  ) {
    poolClass.set(poolDef.address, poolDef.poolClass);
    poolData.set(
      poolDef.address,
      new BehaviorSubject<PoolData | undefined>(undefined)
    );
    poolToken.set(poolDef.address, poolDef.lpToken);

    if (
      !TokenRegistry.getToken(poolDef.lpToken.network, poolDef.lpToken.symbol)
    ) {
      // Register the token in the registry if not yet set
      TokenRegistry.registerToken(poolDef.lpToken);
    }
  }

  public static registerPool(network: Network, poolDef: PoolDefinition) {
    const { poolClass, poolData, poolToken } = this.pools.get(network) || {
      poolClass: new Map<string, typeof BaseLiquidityPool<unknown>>(),
      poolData: new Map<string, BehaviorSubject<PoolData | undefined>>(),
      poolToken: new Map<string, TokenDefinition>(),
    };

    this.addPool(poolDef, poolClass, poolData, poolToken);
    this.pools.set(network, { poolClass, poolData, poolToken });
  }

  public static getPoolToken(network: Network, address: string) {
    return this.pools.get(network)?.poolToken.get(address);
  }

  public static getAllPools(network: Network) {
    return Array.from(this.pools.get(network)?.poolToken.keys() || []);
  }

  public static async fetchPoolData(
    network: Network,
    provider: ethers.providers.Provider
  ) {
    // Loop over all pools and fetch its init data and put it into an observable
    const poolClasses = this.pools.get(network)?.poolClass;
    if (!poolClasses) throw Error(`No pools found for network ${network}`);

    const aggregateCall = Array.from(poolClasses.entries()).flatMap(
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

    const poolData = this.pools.get(network)?.poolData;
    if (!poolData)
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
      if (data) poolData.get(k)?.next(data);
    });
  }

  public static getPoolInstance(network: Network, poolAddress: string) {
    const poolData = this.pools.get(network)?.poolData.get(poolAddress)?.value;
    const PoolClass = this.pools.get(network)?.poolClass.get(poolAddress) as
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
    const poolDataObservable = this.pools
      .get(network)
      ?.poolData.get(poolAddress)
      ?.asObservable();

    const PoolClass = this.pools.get(network)?.poolClass.get(poolAddress) as
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
