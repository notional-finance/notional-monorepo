import { Network, TokenBalance } from '..';
import { BehaviorSubject, Subject } from 'rxjs';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { BigNumber, ethers } from 'ethers';
import FixedPoint from '../exchanges/BalancerV2/FixedPoint';
import crossFetch from 'cross-fetch';

const USE_CROSS_FETCH = process.env['NX_USE_CROSS_FETCH'];
const CACHE_HOSTNAME = process.env['NX_CACHE_HOSTNAME'];

interface CacheSchema<T> {
  values: Array<[string, T | null]>;
  network: Network;
  lastUpdateTimestamp: number;
  lastUpdateBlock: number;
}

export class BaseCachable {
  protected static lastUpdateBlock = new Map<
    Network,
    BehaviorSubject<number>
  >();

  protected static lastUpdateTimestamp = new Map<
    Network,
    BehaviorSubject<number>
  >();

  public static getLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.value || 0;
  }

  public static subscribeLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.asObservable();
  }

  public static getLastUpdateTimestamp(network: Network) {
    return this.lastUpdateTimestamp.get(network)?.value || 0;
  }

  public static subscribeLastUpdateTimestamp(network: Network) {
    return this.lastUpdateTimestamp.get(network)?.asObservable();
  }

  protected static async fetchLatest(
    network: Network,
    aggregateCall: AggregateCall[],
    provider: ethers.providers.Provider,
    subjectMap?: Map<string, Subject<unknown>>
  ) {
    const { block, results } = await aggregate(
      aggregateCall,
      provider,
      // This will call next() on all the update subjects
      subjectMap
    );

    this.lastUpdateBlock.get(network)?.next(block.number);
    this.lastUpdateTimestamp.get(network)?.next(block.timestamp);

    return { blockNumber: block.number, results };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected static reviver(key: string, value: any): any {
    if (Array.isArray(value)) {
      return value.map((v, i) =>
        BaseCachable.reviver(`${key}:${i.toString()}`, v)
      );
    } else if (typeof value === 'object') {
      if (
        Object.prototype.hasOwnProperty.call(value, 'type') &&
        value.type === 'BigNumber'
      ) {
        return BigNumber.from(value);
      } else if (
        Object.prototype.hasOwnProperty.call(value, '_isFixedPoint') &&
        value._isFixedPoint
      ) {
        return FixedPoint.from(value._hex);
      } else if (
        Object.prototype.hasOwnProperty.call(value, '_isTokenBalance') &&
        value._isTokenBalance
      ) {
        return TokenBalance.fromJSON(value);
      }
    }

    return value;
  }

  protected static _serializeToCache<T>(
    network: Network,
    subjectMap: Map<string, BehaviorSubject<T | null>>
  ) {
    const values = Array.from(subjectMap.entries()).map(([key, subject]) => [
      key,
      subject.value,
    ]);

    return JSON.stringify({
      values,
      network,
      lastUpdateTimestamp: this.getLastUpdateTimestamp(network),
      lastUpdateBlock: this.getLastUpdateBlock(network),
    } as CacheSchema<T>);
  }

  protected static async _fetchFromCache<T>(
    subjectMap: Map<string, BehaviorSubject<T | null>>,
    path: string
  ) {
    const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
    try {
      const jsonMap = await (await _fetch(`${CACHE_HOSTNAME}${path}`)).text();

      // @todo configuration must be present on both sides, runtime registration will not result in cache updates
      // configuration will update via the configuration registry
      const data = JSON.parse(jsonMap, this.reviver) as CacheSchema<T>;
      data.values.map(([key, value]) => subjectMap.get(key)?.next(value));

      this.lastUpdateBlock.get(data.network)?.next(data.lastUpdateBlock);
      this.lastUpdateTimestamp
        .get(data.network)
        ?.next(data.lastUpdateTimestamp);
    } catch (error) {
      // @todo log errors somewhere
      console.error(error);
    }
  }
}
