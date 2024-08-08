import { Request } from '@cloudflare/workers-types';
import { CacheSchema, Routes, Servers } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { refreshRegistry } from './registry-helpers';
import { refreshViews } from './views-helpers';

export interface APIEnv extends BaseDOEnv {
  GHOST_ADMIN_KEY: string;
  NX_DD_API_KEY: string;
  NX_DATA_URL: string;
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  VIEWS_NAME: string;
  VIEW_CACHE_R2: R2Bucket;
  ACCOUNT_CACHE_R2: R2Bucket;
  NX_SUBGRAPH_API_KEY: string;
}
export interface BaseDOEnv {
  NX_DD_API_KEY: string;
  NX_ENV: string;
  NX_COMMIT_REF: string;
  NX_SUBGRAPH_API_KEY: string;
  VIEW_CACHE_R2: R2Bucket;
  VERSION: string;
  SUPPORTED_NETWORKS: Network[];
}

export default {
  async fetch(req: Request, env: APIEnv): Promise<Response> {
    const registries = [
      Routes.Configuration,
      Routes.Tokens,
      Routes.Exchanges,
      Routes.Vaults,
      Routes.Oracles,
      `${Routes.Analytics}/analytics`,
    ];

    const url = new URL(req.url);
    const network = url.pathname.split('/')[1];
    if (!network) {
      return new Response('Network not specified', { status: 400 });
    }

    const lastUpdated = await Promise.all(
      registries.map(async (route) => {
        const obj = await env.VIEW_CACHE_R2.get(`${network}/${route}`);
        if (obj) {
          const data = JSON.parse(await obj.text()) as CacheSchema<unknown>;
          return {
            [route.replace('views/analytics', 'analytics')]:
              data.lastUpdateTimestamp,
          };
        }
        return { [route.replace('views/analytics', 'analytics')]: null };
      })
    );

    return new Response(JSON.stringify(Object.assign({}, ...lastUpdated)), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async scheduled(event: ScheduledController, env: APIEnv): Promise<void> {
    const currentMinute = new Date(event.scheduledTime).getMinutes();

    if (currentMinute % 10 === 0) {
      // Run these refreshes every 10 minutes
      await Promise.all([
        refreshRegistry(env, Routes.Configuration, Servers.ConfigurationServer),
        refreshRegistry(env, Routes.Tokens, Servers.TokenRegistryServer),
        refreshViews(env),
      ]);
    }

    // Run these refreshes every minute
    await Promise.all([
      refreshRegistry(env, Routes.Exchanges, Servers.ExchangeRegistryServer),
      refreshRegistry(env, Routes.Vaults, Servers.VaultRegistryServer),
      refreshRegistry(env, Routes.Oracles, Servers.OracleRegistryServer),
    ]);
  },
};
