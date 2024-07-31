import { APIEnv, MetricType } from '.';
import { Network, getNowSeconds } from '@notional-finance/util';
import { AnalyticsServer } from '@notional-finance/core-entities/src/server/analytics-server';
import { createLogger } from './logger';
import { putStorageKey } from './registry-helpers';

async function fetchDBView(
  analyticsServer: AnalyticsServer,
  env: APIEnv,
  network: Network,
  name: string
) {
  try {
    const data = JSON.stringify(await analyticsServer.fetchView(network, name));
    const key = `views/${network}/${name}`;
    return putStorageKey(env, key, data);
  } catch (e) {
    console.error(e);
  }
}

async function fetchAllDBViews(
  analyticsServer: AnalyticsServer,
  env: APIEnv,
  network: Network
) {
  const resp = await fetch(`${env.DATA_SERVICE_URL}/views?network=${network}`, {
    headers: {
      'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    },
  });
  const data = (await resp.json()) as { view_name: string }[];
  await Promise.all(
    data.map((v) => fetchDBView(analyticsServer, env, network, v.view_name))
  );
}

async function storeDocument(
  env: APIEnv,
  result: { data?: unknown },
  name: string,
  network: Network
) {
  const key = `views/${network}/${name}`;
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

export function getViewStorageKey(url: URL): string {
  const network = url.pathname.split('/')[1];
  if (!network) throw Error('Network Not Found');
  const view = url.pathname.split('/')[3];
  if (!view) throw Error('View Not Found');
  return `views/${network}/${view}`;
}

export async function refreshViews(env: APIEnv) {
  const logger = createLogger(env, 'views');
  const analyticsServer = new AnalyticsServer(
    env.DATA_SERVICE_URL,
    env.DATA_SERVICE_AUTH_TOKEN,
    env
  );

  await Promise.all(
    env.SUPPORTED_NETWORKS.flatMap((network) => {
      return [
        fetchAllDBViews(analyticsServer, env, network),
        fetchAllGraphViews(analyticsServer, env, network),
        analyticsServer
          .refresh(network)
          .then(async (data) => {
            if (data) {
              console.log('Wrote analytics data for ', network);
              putStorageKey(env, `views/${network}/analytics`, data);

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
