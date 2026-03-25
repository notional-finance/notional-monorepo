import { AnalyticsServer } from '@notional-finance/core-entities/src/server/analytics-server';
import { putStorageKey } from './registry-helpers';
import { BaseDOEnv } from '.';
import { Network } from '@notional-finance/util';
import {
  AnalyticsData,
  destroyGraphClient,
} from '@notional-finance/core-entities';

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
    if (result.status !== 200)
      throw Error(
        `Failed Request: ${env.DATA_SERVICE_URL}/query?network=${network}&view=${name}`
      );

    const data = await result.json();
    const key = `${network}/views/${name}`;
    return putStorageKey(env, key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

async function fetchAllDBViews(env: BaseDOEnv, network: Network) {
  const resp = await fetch(`${env.DATA_SERVICE_URL}/views?network=${network}`, {
    headers: {
      'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    },
  });
  const data = (await resp.json()) as { view_name: string }[];
  const vaultAddresses = data
    .filter((v) => v.view_name.startsWith('0x'))
    .map((v) => v.view_name);
  for (const v of data) {
    await fetchDBView(env, network, v.view_name);
  }

  return vaultAddresses;
}

export function getFetchView(env: BaseDOEnv) {
  return async (network: Network, view: string) => {
    return env.VIEW_CACHE_R2.get(`${network}/views/${view}`).then((res) => {
      if (!res) throw new Error(`View ${view} not found`);
      return res.json() as Promise<AnalyticsData>;
    });
  };
}

export async function refreshViews(env: BaseDOEnv, network: Network) {
  const analyticsServer = new AnalyticsServer(env);

  const vaultAddresses = await fetchAllDBViews(env, network);
  // Saves time series data to R2 for the registry to serve
  const { timeSeries, priceChanges } = await analyticsServer.fetchTimeSeries(
    network,
    vaultAddresses,
    getFetchView(env)
  );

  await putStorageKey(
    env,
    `${network}/views/priceChanges`,
    JSON.stringify(Object.fromEntries(priceChanges))
  );

  await Promise.all(
    timeSeries.map((v) => {
      return putStorageKey(env, `${network}/views/${v.id}`, JSON.stringify(v));
    })
  );

  await destroyGraphClient();
}
