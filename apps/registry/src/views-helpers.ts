import { AnalyticsServer } from '@notional-finance/core-entities/src/server/analytics-server';
import { putStorageKey } from './registry-helpers';
import { BaseDOEnv } from '.';
import { Network } from '@notional-finance/util';

async function fetchDBView(env: BaseDOEnv, network: Network, name: string) {
  try {
    const result = await fetch(
      `${env.DATA_SERVICE_URL}/query?network=${network}&view=${name}`,
      {
        headers: {
          'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
        },
      }
    );
    const data = await result.json();
    if (result.status !== 200)
      throw Error(`Failed Request: ${network}/${name}`);

    const key = `${network}/views/${name}`;
    return putStorageKey(env, key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

async function storeDocument(
  env: BaseDOEnv,
  result: { data?: unknown },
  name: string,
  network: Network
) {
  const key = `${network}/views/${name}`;
  if (result['data'])
    return putStorageKey(env, key, JSON.stringify(result['data']));
}

async function fetchAllDBViews(env: BaseDOEnv, network: Network) {
  const resp = await fetch(`${env.DATA_SERVICE_URL}/views?network=${network}`, {
    headers: {
      'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    },
  });
  const data = (await resp.json()) as { view_name: string }[];
  await Promise.all(data.map((v) => fetchDBView(env, network, v.view_name)));
}

async function fetchAllGraphViews(
  analyticsServer: AnalyticsServer,
  env: BaseDOEnv,
  network: Network
) {
  if (network === Network.all) return;

  await Promise.all([
    analyticsServer
      .fetchGraphDocument(network, 'ExternalLendingHistoryDocument')
      .then((d) => storeDocument(env, d, 'ExternalLendingHistory', network)),
    analyticsServer
      .fetchGraphDocument(network, 'MetaDocument')
      .then((d) => storeDocument(env, d, 'SubgraphMeta', network)),
  ]);
}

export async function refreshViews(env: BaseDOEnv) {
  // const logger = createLogger(env, 'views');
  const analyticsServer = new AnalyticsServer(env);

  for (const network of env.SUPPORTED_NETWORKS) {
    await fetchAllDBViews(env, network);
    await fetchAllGraphViews(analyticsServer, env, network);
    // Saves time series data to R2 for the registry to serve
    await analyticsServer.fetchTimeSeries(network).then((resp) => {
      return resp.map((v) => {
        return putStorageKey(
          env,
          `${network}/views/${v.id}`,
          JSON.stringify(v)
        );
      });
    });
  }
}
