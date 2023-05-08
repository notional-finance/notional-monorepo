import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
} from '@notional-finance/util';
import { Exact, Maybe } from '../.graphclient';
import { CacheSchema } from '../registry/index';
import { BaseRegistry } from '../registry/base-registry';

type GraphSDKQuery<R> = (
  variables?: Exact<{ [key: string]: unknown }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
) => Promise<R>;

export abstract class ServerRegistry<T> extends BaseRegistry<T> {
  protected async _fetchUsingMulticall(
    network: Network,
    calls: AggregateCall<T>[],
    transforms: ((r: Record<string, T>) => Record<string, T>)[]
  ): Promise<CacheSchema<T>> {
    const { block, results } = await aggregate<T>(
      calls,
      this.getProvider(network)
    );
    const finalResults = transforms.reduce((r, t) => t(r), results);

    return {
      values: Object.entries(finalResults),
      network,
      lastUpdateTimestamp: block.timestamp,
      lastUpdateBlock: block.number,
    };
  }

  protected async _fetchUsingGraph<
    R extends { _meta?: Maybe<{ block: { number: number } }> }
  >(
    network: Network,
    query: GraphSDKQuery<R>,
    transform: (r: R) => Record<string, T>,
    variables?: Exact<{ [key: string]: unknown }>
  ): Promise<CacheSchema<T>> {
    const data = await query(variables, { chainName: network });
    const finalResults = transform(data);
    const blockNumber = data._meta?.block.number || 0;

    return {
      values: Object.entries(finalResults),
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: blockNumber,
    };
  }

  protected getProvider(network: Network) {
    return getProviderFromNetwork(network);
  }

  /** Triggers a refresh of the underlying data */
  public async refresh(network: Network, intervalNum: number) {
    this._updateNetworkObservables(await this._refresh(network, intervalNum));
  }

  /** Serializes the data for the given network */
  public serializeToJSON(network: Network) {
    const subjects = this._getNetworkSubjects(network);
    const values = Array.from(subjects.entries()).map(([key, subject]) => [
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
}
