import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  HttpLink,
  from,
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
  gql,
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import fetch from 'cross-fetch';

type BatchTData<TData> = { batch: TData[] };

type GraphKey = keyof typeof GraphClient.graphUrls;
const subgraphApiKey = process.env['NX_SUBGRAPH_API_KEY'];

export class GraphClient {
  public apollo: ApolloClient<NormalizedCacheObject>;

  public static graphUrls = {
    'mainnet/notional': `"https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/BnVrrrzw6cLHxFUkgtfmWcF83DopC8jrYnrMnysVKptm"`,
    'goerli/notional':
      'https://api.thegraph.com/subgraphs/name/notional-finance/goerli-v2',
  };

  public static getGraphKey(network: string, protocol: string) {
    const key = `${network}/${protocol}`;
    return Array.from(Object.keys(GraphClient.graphUrls)).find((s) => s === key)
      ? (key as GraphKey)
      : undefined;
  }

  static getClient(
    graphKey: GraphKey,
    pollInterval: number,
    skipFetchSetup = false
  ) {
    return new GraphClient(
      GraphClient.graphUrls[graphKey],
      pollInterval,
      skipFetchSetup
    );
  }

  constructor(
    public graphHttpEndpoint: string,
    public pollInterval: number,
    skipFetchSetup: boolean
  ) {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        });
      }
      if (networkError) console.log(`[Network error]: ${networkError}`);
    });
    const retryLink = new RetryLink();
    let httpLink: HttpLink;
    if (skipFetchSetup) {
      httpLink = new HttpLink({ uri: graphHttpEndpoint });
    } else {
      httpLink = new HttpLink({ uri: graphHttpEndpoint, fetch });
    }

    this.apollo = new ApolloClient<NormalizedCacheObject>({
      uri: graphHttpEndpoint,
      cache: new InMemoryCache(),
      link: from([errorLink, retryLink, httpLink]),
    });
  }

  public async queryOrThrow<TData = any, TVariables = OperationVariables>(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: TVariables
  ) {
    const result = await this.apollo.query<TData, TVariables>({
      query,
      fetchPolicy: 'network-only',
      variables,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  /**
   * Uses the recommended more performant batch query method here:
   * https://thegraph.com/docs/en/developer/graphql-api#pagination
   *
   * The $id should be used as filter so that it hits the underlying index and we get
   * a faster query. Need to save the largest ID per query. Queries need to have the variable
   * $lastID in order to work with this method:
   *
   * {
   *    query allAccounts($lastID: String) {
   *      batch: accounts(
   *          first: $pageSize,
   *          where: { id_gt: $lastID },
   *          orderBy: id, orderDirection: asc
   *      ) {
   *        id
   *        owner
   *      }
   *    }
   *  }
   *
   * @param query
   * @param variables
   * @returns
   */
  public async batchQuery<
    TData extends { id: string },
    TVariables = OperationVariables
  >(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    initialID = '0',
    pageSize = 1000
  ) {
    let hasMoreResults = false;
    let lastID = initialID;
    const batchResult: TData[] = [];

    do {
      // eslint-disable-next-line no-await-in-loop
      const results = await this.queryOrThrow<BatchTData<TData>, TVariables>(
        query,
        {
          ...variables,
          pageSize,
          lastID,
        } as unknown as TVariables
      );
      batchResult.push(...results.batch);

      hasMoreResults = results.batch.length > 0;
      if (hasMoreResults) lastID = results.batch[results.batch.length - 1].id;
    } while (hasMoreResults);

    return batchResult;
  }

  /**
   * Builds a query compatible with `batchQuery`
   * @param objectName
   * @param queryBody
   * @returns DocumentNode
   */
  public static buildBatchQuery(objectName: string, queryBody: string) {
    return gql`
      query batchQuery($pageSize: Int!, $lastID: String) {
        batch: ${objectName}(
          first: $pageSize,
          where: { id_gt: $lastID },
          orderBy: id, orderDirection: asc
        ) ${queryBody}
      }
    `;
  }

  public static buildQuery(queryBody: string) {
    return gql`
      ${queryBody}
    `;
  }
}
