import { Network } from '..';
import { BehaviorSubject, Subject } from 'rxjs';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { ethers } from 'ethers';

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

    // TODO: also update timestamp here
    this.lastUpdateBlock.get(network)?.next(block.number);
    this.lastUpdateTimestamp.get(network)?.next(block.timestamp);

    return { blockNumber: block.number, results };
  }

  // protected static async serializeToCache
  // protected static async fetchFromCache
}
