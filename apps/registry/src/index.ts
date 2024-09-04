import { Request } from '@cloudflare/workers-types';
import { NetworkServerModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { putStorageKey } from './registry-helpers';

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

async function execute(
  env: BaseDOEnv,
  network: Network,
  isFullRefresh: boolean
) {
  const networkModel = NetworkServerModel.create({ network });
  networkModel.initialize(async (data: string) => {
    await putStorageKey(env, `${network}/snapshot`, data);
  }, env);

  await networkModel.refresh(isFullRefresh);
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

    const network = url.pathname.split('/')[1];
    if (!network) {
      return new Response('Network not specified', { status: 400 });
    }

    const obj = await env.VIEW_CACHE_R2.get(`${network}/snapshot`);
    const { lastUpdated } = (await obj.json()) as { lastUpdated: number };

    return new Response(JSON.stringify({ lastUpdated }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async scheduled(event: ScheduledController, env: BaseDOEnv): Promise<void> {
    const currentMinute = new Date(event.scheduledTime).getMinutes();
    await Promise.all(
      env.SUPPORTED_NETWORKS.map((network) =>
        execute(env, network, currentMinute % 10 === 0)
      )
    );
  },
};
