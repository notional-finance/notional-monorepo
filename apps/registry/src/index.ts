import { Request } from '@cloudflare/workers-types';
import { NetworkServerModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { putStorageKey } from './registry-helpers';
import { fetchReconciliationViews, refreshViews } from './views-helpers';

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

async function copyKeys(env: BaseDOEnv, key: string) {
  const response = await fetch(`https://registry.notional.finance/${key}`);
  const data = await response.text();
  await env.VIEW_CACHE_R2.put(`${key}`, data);
}

async function execute(env: BaseDOEnv, network: Network, onlyViews: boolean) {
  if (onlyViews) {
    await refreshViews(env, network);

    if (network === Network.all) {
      // NOTE: copy these keys from registry prod
      await copyKeys(env, 'mainnet/note/NOTESupply');
      await copyKeys(env, 'mainnet/note/sNOTEPoolData');
      await copyKeys(env, 'mainnet/note/sNOTEReinvestments');
      await copyKeys(env, 'all/views/points_prices');
      await copyKeys(env, 'all/kpi');
    }

    return;
  }

  await fetchReconciliationViews(env, network);
  const networkModel = NetworkServerModel.create({ network });
  networkModel.initialize(async (data: string) => {
    await putStorageKey(env, `${network}/snapshot`, data);
  }, env);
  await networkModel.refresh(true);

  const oracles = {
    network,
    values: Array.from(networkModel.oracles.entries()).map(([key, value]) => [
      key,
      value,
    ]),
    lastUpdateTimestamp: networkModel.lastUpdated,
    lastUpdateBlock: networkModel.lastUpdatedBlock,
  };

  const vaults = {
    network,
    values: Array.from(networkModel.vaults.entries()).map(([key, value]) => [
      key,
      value,
    ]),
    lastUpdateTimestamp: networkModel.lastUpdated,
    lastUpdateBlock: networkModel.lastUpdatedBlock,
  };

  await putStorageKey(env, `${network}/oracles`, JSON.stringify(oracles));
  await putStorageKey(env, `${network}/vaults`, JSON.stringify(vaults));
}

export default {
  async fetch(req: Request, env: BaseDOEnv): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/execute') {
      await Promise.all(
        env.SUPPORTED_NETWORKS.map((network) => execute(env, network, true))
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

    const obj = await env.VIEW_CACHE_R2.get(`${network}/snapshot`);
    if (!obj) return new Response('Not found', { status: 404 });
    const { lastUpdated } = (await obj.json()) as { lastUpdated: number };

    return new Response(JSON.stringify({ lastUpdated }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async scheduled(event: ScheduledController, env: BaseDOEnv): Promise<void> {
    const currentMinute = new Date(event.scheduledTime).getMinutes();
    if (currentMinute % 2 === 0) {
      await execute(env, Network.mainnet, currentMinute === 10);
      await execute(env, Network.all, currentMinute === 10);
    } else if (currentMinute % 2 === 1) {
      await execute(env, Network.arbitrum, currentMinute === 5);
    }
  },
};
