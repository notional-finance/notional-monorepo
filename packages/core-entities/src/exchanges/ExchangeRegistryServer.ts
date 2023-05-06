import { aggregate } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { PoolClasses } from '.';
import { PoolDefinition, PoolData, TokenBalance } from '..';
import { ServerRegistry } from '../registry/ServerRegistry';
import defaultPools from './DefaultPools';

export class ExchangeRegistryServer extends ServerRegistry<PoolDefinition> {
  protected async _refresh(network: Network) {
    const networkPools = defaultPools[network];
    const poolKeys = new Map<string, string[]>();

    const calls = networkPools.flatMap(({ PoolClass, address }) => {
      const keys = [] as string[];

      const calls = PoolClasses[PoolClass].getInitData(network, address).map(
        (c) => {
          keys.push(...c.key);
          // Prepend the pool address to the call data
          return Object.assign(c, { key: `${address}.${c.key}` });
        }
      );
      poolKeys.set(address, keys);
      return calls;
    });

    const { block, results } = await aggregate(
      calls,
      this.getProvider(network)
    );

    const values = networkPools.map((pool) => {
      const { address } = pool;
      const keys = poolKeys.get(address) || [];

      // Unpack the pool keys into latestPoolData
      const latestPoolData = keys.reduce((obj, k) => {
        const value = results[`${address}.${k}`];
        if (k === 'balances') {
          return Object.assign(obj, { balances: value as TokenBalance[] });
        } else if (k === 'totalSupply') {
          return Object.assign(obj, { totalSupply: value as TokenBalance });
        } else {
          return Object.assign(obj, {
            poolParams: Object.assign(obj.poolParams, { value }),
          });
        }
      }, {} as PoolData);

      return [address, Object.assign(pool, { latestPoolData })] as [
        string,
        PoolDefinition
      ];
    });

    return {
      values,
      network: network,
      lastUpdateBlock: block.number,
      lastUpdateTimestamp: block.timestamp,
    };
  }
}
