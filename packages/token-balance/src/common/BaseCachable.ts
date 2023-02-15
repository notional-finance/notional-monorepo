import { Network } from '..';
import { BehaviorSubject, Subject } from 'rxjs';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { BigNumber, ethers } from 'ethers';

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

  protected static reviver(key: string, value: unknown) {
    if (
      value &&
      typeof value === 'object' &&
      Object.prototype.hasOwnProperty.call(value, 'type')
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((value as any)['type']) {
        case 'BigNumber':
          return BigNumber.from(value);

        default:
          throw Error(`unknown value for key ${key}: ${value}`);
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
    jsonMap: string
  ) {
    // @todo run http fetch here
    // @todo configuration must be present on both sides, runtime registration will not result in cache updates
    // configuration will update via the configuration registry
    const data = JSON.parse(jsonMap, this.reviver) as CacheSchema<T>;
    data.values.map(([key, value]) => subjectMap.get(key)?.next(value));

    this.lastUpdateBlock.get(data.network)?.next(data.lastUpdateBlock);
    this.lastUpdateTimestamp.get(data.network)?.next(data.lastUpdateTimestamp);
  }
}
