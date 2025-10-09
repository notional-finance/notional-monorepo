import { Request } from '@cloudflare/workers-types';
import { NetworkServerModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { putStorageKey } from './registry-helpers';
import { refreshViews } from './views-helpers';

export interface BaseDOEnv {
  NX_COMMIT_REF: string | undefined;
  NX_ENV: string;
  NX_DD_API_KEY: string;
  NX_SUBGRAPH_API_KEY: string;
  VIEW_CACHE_R2: R2Bucket;
  SUPPORTED_NETWORKS: Network[];
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
}

async function execute(env: BaseDOEnv, network: Network, onlyViews: boolean) {
  if (onlyViews) {
    await refreshViews(env, network);
    return;
  }

  const networkModel = NetworkServerModel.create({ network });
  networkModel.initialize(async (data: string) => {
    await putStorageKey(env, `${network}/v4/snapshot`, data);
  }, env);
  await networkModel.refresh(true);
}

export default {
  async fetch(req: Request, env: BaseDOEnv): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/refreshViews') {
      await Promise.all(
        env.SUPPORTED_NETWORKS.map((network) => execute(env, network, true))
      );
      return new Response('Executed', { status: 200 });
    } else if (url.pathname === '/refresh') {
      await Promise.all(
        env.SUPPORTED_NETWORKS.map((network) => execute(env, network, false))
      );
      return new Response('Executed', { status: 200 });
    }

    // Allow fetches directly from the registry for different files, useful for local development
    if (url.pathname.split('/').length > 2) {
      const route = url.pathname.slice(1);
      const obj = (await env.VIEW_CACHE_R2.get(route)) as R2ObjectBody;
      return new Response(await obj.text(), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    const network = url.pathname.split('/')[1];
    if (!network) {
      return new Response('Network not specified', { status: 400 });
    }

    const obj = await env.VIEW_CACHE_R2.get(`${network}/v4/snapshot`);
    if (!obj) return new Response('Not found', { status: 404 });
    const { lastUpdated } = (await obj.json()) as { lastUpdated: number };

    return new Response(JSON.stringify({ lastUpdated }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async scheduled(event: ScheduledController, env: BaseDOEnv): Promise<void> {
    const currentMinute = new Date(event.scheduledTime).getMinutes();
    await execute(env, Network.mainnet, currentMinute === 0);
    await execute(env, Network.all, currentMinute === 0);
  },
};
