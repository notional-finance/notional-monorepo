import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
} from '@notional-finance/util';
import { CacheSchema } from '../registry/index';
import { BaseRegistry } from '../registry/base-registry';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export async function loadGraphClientDeferred() {
  const {
    execute,
    AllTokensDocument,
    AllConfigurationDocument,
    AllOraclesDocument,
  } = await import('../.graphclient/index');

  return {
    execute,
    AllTokensDocument,
    AllConfigurationDocument,
    AllOraclesDocument,
  };
}

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

  protected async _fetchUsingGraph<R>(
    network: Network,
    query: TypedDocumentNode<R, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (r: R) => Record<string, T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: any
  ): Promise<CacheSchema<T>> {
    // NOTE: in order for this to deploy with cloudflare workers, the import statement
    // has to be deferred until here.
    const { execute } = await loadGraphClientDeferred();
    const data = await execute(query, variables, { chainName: network });
    const finalResults = transform(data['data']);
    const blockNumber = data['data']._meta?.block.number || 0;

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
