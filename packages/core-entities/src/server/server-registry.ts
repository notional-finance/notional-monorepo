import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
} from '@notional-finance/util';
import { CacheSchema } from '..';
import { BaseRegistry } from '../base';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export type TypedDocumentReturnType<T> = T extends TypedDocumentNode<
  infer U,
  infer _V
>
  ? U
  : unknown;
export type DocumentTypes = Awaited<ReturnType<typeof loadGraphClientDeferred>>;

export async function loadGraphClientDeferred() {
  const {
    execute,
    AllTokensDocument,
    AllConfigurationDocument,
    AllOraclesDocument,
    AllVaultsDocument,
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
  } = await import('../.graphclient/index');

  return {
    execute,
    AllTokensDocument,
    AllConfigurationDocument,
    AllOraclesDocument,
    AllVaultsDocument,
  };
}

export async function fetchUsingMulticall<T>(
  network: Network,
  calls: AggregateCall<T>[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transforms: ((r: Record<string, any>) => Record<string, T>)[]
): Promise<CacheSchema<T>> {
  const { block, results } = await aggregate<T>(
    calls,
    getProviderFromNetwork(network)
  );
  const finalResults = transforms.reduce((r, t) => t(r), results);

  return {
    values: Object.entries(finalResults),
    network,
    lastUpdateTimestamp: block.timestamp,
    lastUpdateBlock: block.number,
  };
}

export async function fetchUsingGraph<T, R, V>(
  network: Network,
  query: TypedDocumentNode<R, V>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (r: R) => Record<string, T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: V
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

export abstract class ServerRegistry<T> extends BaseRegistry<T> {
  protected async _fetchUsingMulticall(
    network: Network,
    calls: AggregateCall<T>[],
    transforms: ((r: Record<string, T>) => Record<string, T>)[]
  ): Promise<CacheSchema<T>> {
    return fetchUsingMulticall<T>(network, calls, transforms);
  }

  protected async _fetchUsingGraph<R, V>(
    network: Network,
    query: TypedDocumentNode<R, V>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (r: R) => Record<string, T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: V
  ): Promise<CacheSchema<T>> {
    return fetchUsingGraph<T, R, V>(network, query, transform, variables);
  }

  protected getProvider(network: Network) {
    // Skip fetch setup in cloudflare workers
    return getProviderFromNetwork(network, true);
  }

  public hasAllNetwork() {
    return false;
  }

  /** Triggers a refresh of the underlying data */
  public async refresh(network: Network, intervalNum: number) {
    if (!this.hasAllNetwork() && network === Network.All) return;
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
