import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
} from '@notional-finance/util';
import { CacheSchema } from '..';
import { BaseRegistry } from '../base';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { providers } from 'ethers';

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
    AllAccountsDocument,
    AllTokensDocument,
    AllConfigurationDocument,
    AllOraclesDocument,
    AllVaultsDocument,
    AllTokensByBlockDocument,
    AllConfigurationByBlockDocument,
    AllOraclesByBlockDocument,
    AllVaultsByBlockDocument,
    AccountTransactionHistoryDocument,
    AccountBalanceStatementDocument,
    HistoricalOracleValuesDocument,
    HistoricalTradingActivityDocument,
    VaultReinvestmentDocument,
    ActiveAccountsDocument,
    ExternalLendingHistoryDocument,
    NetworkTransactionHistoryDocument,
    ExchangeRateValuesDocument,
    MetaDocument,
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
  } = await import('../.graphclient/index');

  return {
    execute,
    AllAccountsDocument,
    AllTokensDocument,
    AllConfigurationDocument,
    AllOraclesDocument,
    AllVaultsDocument,
    AllTokensByBlockDocument,
    AllConfigurationByBlockDocument,
    AllOraclesByBlockDocument,
    AllVaultsByBlockDocument,
    ExchangeRateValuesDocument,
    AccountTransactionHistoryDocument,
    AccountBalanceStatementDocument,
    HistoricalOracleValuesDocument,
    HistoricalTradingActivityDocument,
    VaultReinvestmentDocument,
    ActiveAccountsDocument,
    ExternalLendingHistoryDocument,
    NetworkTransactionHistoryDocument,
    MetaDocument,
  };
}

export async function fetchUsingMulticall<T>(
  network: Network,
  calls: AggregateCall<T>[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transforms: ((r: Record<string, any>) => Record<string, T>)[],
  provider?: providers.Provider
): Promise<CacheSchema<T>> {
  let block: providers.Block;
  let results: Record<string, T>;
  try {
    ({ block, results } = await aggregate<T>(
      calls,
      provider || getProviderFromNetwork(network)
    ));
  } catch (e) {
    if (provider) {
      // Occasionally the supplied provider may fail, if so then we use the default
      // provider instead
      ({ block, results } = await aggregate<T>(
        calls,
        getProviderFromNetwork(network)
      ));
    } else {
      throw e;
    }
  }
  const finalResults = transforms.reduce((r, t) => t(r), results);

  return {
    values: Object.entries(finalResults),
    network,
    lastUpdateTimestamp: block.timestamp,
    lastUpdateBlock: block.number,
  };
}

export async function fetchGraphPaginate<R, V>(
  network: Network,
  query: TypedDocumentNode<R, V>,
  rootVariable: string | undefined,
  variables?: V
) {
  const { execute } = await loadGraphClientDeferred();
  const executionResult = await execute(query, variables, {
    chainName: network,
  });
  if (executionResult['errors']) console.error(executionResult['errors']);

  while (rootVariable && executionResult['data'][rootVariable].length < 1000) {
    (variables as unknown as { skip: number })['skip'] += 1000;
    const r = await execute(query, variables, {
      chainName: network,
    });

    executionResult['data'][rootVariable].push(r['data'][rootVariable]);
  }

  return executionResult;
}

export async function fetchGraph<T, R, V extends { [key: string]: unknown }>(
  network: Network,
  query: TypedDocumentNode<R, V>,
  transform: (r: R) => Record<string, T>,
  variables?: V,
  rootVariable?: string
): Promise<{ finalResults: Record<string, T>; blockNumber: number }> {
  // NOTE: in order for this to deploy with cloudflare workers, the import statement
  // has to be deferred until here.
  const { execute } = await loadGraphClientDeferred();

  if (variables && variables['skip'] !== undefined && rootVariable) {
    let finalResults = {} as Record<string, T>;
    let blockNumber = 0;
    do {
      const data = await execute(query, variables, { chainName: network });
      if (data['errors']) console.error(data['errors']);

      finalResults = Object.assign(finalResults, transform(data['data']));
      if (data['data'][rootVariable].length < 1000) {
        blockNumber = data['data']._meta?.block.number || 0;
        break;
      } else {
        (variables as unknown as { skip: number })['skip'] += 1000;
      }
      // eslint-disable-next-line no-constant-condition
    } while (true);

    return { finalResults, blockNumber };
  } else {
    const data = await execute(query, variables, { chainName: network });
    const finalResults = transform(data['data']);
    const blockNumber = data['data']._meta?.block.number || 0;
    return { finalResults, blockNumber };
  }
}

export async function fetchUsingGraph<
  T,
  R,
  V extends { [key: string]: unknown }
>(
  network: Network,
  query: TypedDocumentNode<R, V>,
  transform: (r: R) => Record<string, T>,
  variables?: V,
  rootVariable?: string
): Promise<CacheSchema<T>> {
  const { finalResults, blockNumber } = await fetchGraph(
    network,
    query,
    transform,
    variables,
    rootVariable
  );

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

  protected async _fetchUsingGraph<R, V extends { [key: string]: unknown }>(
    network: Network,
    query: TypedDocumentNode<R, V>,
    transform: (r: R) => Record<string, T>,
    variables?: V,
    rootVariable?: string
  ): Promise<CacheSchema<T>> {
    return fetchUsingGraph<T, R, V>(
      network,
      query,
      transform,
      variables,
      rootVariable
    );
  }

  protected getProvider(network: Network) {
    // Skip fetch setup in cloudflare workers
    return getProviderFromNetwork(network, true);
  }

  public hasAllNetwork() {
    return false;
  }

  /** Triggers a refresh of the underlying data */
  public async refresh(network: Network) {
    if (!this.hasAllNetwork() && network === Network.all) return;
    this._updateNetworkObservables(await this._refresh(network));
  }

  public async refreshAtBlock(network: Network, blockNumber: number) {
    if (!this.hasAllNetwork() && network === Network.all) return;
    this._updateNetworkObservables(await this._refresh(network, blockNumber));
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
