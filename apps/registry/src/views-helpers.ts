import {
  MetricType,
  Network,
  getNowSeconds,
  DATA_SERVICE_URL,
} from '@notional-finance/util';
import { AnalyticsServer } from '@notional-finance/core-entities/src/server/analytics-server';
import { createLogger, putStorageKey } from './registry-helpers';
import { APIEnv } from '.';

async function fetchDBView(env: APIEnv, network: Network, name: string) {
  try {
    const result = await fetch(
      `${DATA_SERVICE_URL}/query?network=${network}&view=${name}`,
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

async function fetchAllDBViews(env: APIEnv, network: Network) {
  const resp = await fetch(`${DATA_SERVICE_URL}/views?network=${network}`, {
    headers: {
      'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    },
  });
  const data = (await resp.json()) as { view_name: string }[];
  await Promise.all(data.map((v) => fetchDBView(env, network, v.view_name)));
}

async function storeDocument(
  env: APIEnv,
  result: { data?: unknown },
  name: string,
  network: Network
) {
  const key = `${network}/views/${name}`;
  if (result['data'])
    return putStorageKey(env, key, JSON.stringify(result['data']));
}

async function fetchAllGraphViews(
  analyticsServer: AnalyticsServer,
  env: APIEnv,
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

export async function refreshViews(env: APIEnv) {
  const logger = createLogger(env, 'views');
  const analyticsServer = new AnalyticsServer(
    DATA_SERVICE_URL,
    env.DATA_SERVICE_AUTH_TOKEN,
    env
  );

  await Promise.all(
    env.SUPPORTED_NETWORKS.flatMap((network) => {
      return [
        fetchAllDBViews(env, network),
        fetchAllGraphViews(analyticsServer, env, network),
        analyticsServer
          .refresh(network)
          .then(async (data) => {
            if (data) {
              console.log('Wrote analytics data for ', network);
              putStorageKey(env, `${network}/views/analytics`, data);

              await logger.submitMetrics({
                series: [
                  {
                    metric: 'registry.data.analytics',
                    points: [
                      {
                        value: 1,
                        timestamp: getNowSeconds(),
                      },
                    ],
                    tags: [`network:${network}`],
                    type: MetricType.Gauge,
                  },
                ],
              });
            }
          })
          .catch((e) => {
            console.log('error', e);
          }),
      ];
    })
  );
}
