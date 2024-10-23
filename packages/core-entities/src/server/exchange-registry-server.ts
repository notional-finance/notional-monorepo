import { aggregate } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { PoolClasses } from '../exchanges';
import { PoolDefinition, PoolData, TokenBalance } from '..';
import { ServerRegistry } from './server-registry';
import defaultPools from '../exchanges/default-pools';

export class ExchangeRegistryServer extends ServerRegistry<PoolDefinition> {
  protected async _refresh(network: Network, blockNumber?: number) {
    const networkPools = defaultPools[network].filter(({ earliestBlock }) =>
      blockNumber !== undefined && earliestBlock !== undefined
        ? earliestBlock <= blockNumber
        : true
    );
    const poolKeys = new Map<string, string[]>();

    const calls = networkPools.flatMap(({ PoolClass, address }) => {
      const keys = [] as string[];

      const calls = PoolClasses[PoolClass].getInitData(network, address).map(
        (c) => {
          // Prepend the pool address to the call data so that matching keys do not
          // override each other
          let newKeys: string | string[];
          if (Array.isArray(c.key)) {
            keys.push(...c.key);
            newKeys = c.key.map((k) => `${address}.${k}`);
          } else {
            keys.push(c.key);
            newKeys = `${address}.${c.key}`;
          }

          return Object.assign(c, { key: newKeys });
        }
      );
      poolKeys.set(address, keys);
      return calls;
    });

    const { block, results } = await aggregate(
      calls,
      this.getProvider(network),
      blockNumber,
      true // allow failure
    );

    const offChainPoolParams: Record<
      string,
      Record<string, unknown>
    > = Object.fromEntries(
      await Promise.all(
        networkPools.map(async (pool) => {
          const { address } = pool;
          const params = await PoolClasses[
            pool.PoolClass
          ].getPoolParamsOffChain(network, address);
          return [address, params];
        })
      )
    );

    const values = networkPools.map((pool) => {
      const { address } = pool;
      const keys = poolKeys.get(address) || [];

      // Unpack the pool keys into latestPoolData
      const latestPoolData = keys.reduce(
        (obj, k) => {
          const value = results[`${address}.${k}`];
          if (k === 'balances') {
            return Object.assign(obj, { balances: value as TokenBalance[] });
          } else if (k === 'totalSupply') {
            return Object.assign(obj, { totalSupply: value as TokenBalance });
          } else {
            return Object.assign(obj, {
              poolParams: Object.assign(obj.poolParams, { [k]: value }),
            });
          }
        },
        { poolParams: offChainPoolParams[address] || {} } as PoolData
      );

      return [address, { ...pool, latestPoolData }] as [string, PoolDefinition];
    });

    return {
      values,
      network: network,
      lastUpdateBlock: block.number,
      lastUpdateTimestamp: block.timestamp,
    };
  }
}
