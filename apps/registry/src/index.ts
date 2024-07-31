import { Request } from '@cloudflare/workers-types';
import { CacheSchema } from '@notional-finance/core-entities';
import {
  BaseDOEnv,
  refreshRegistry,
  Routes,
  Servers,
} from '@notional-finance/durable-objects';

export default {
  async fetch(req: Request, env: BaseDOEnv): Promise<Response> {
    const registries = [
      Routes.Configuration,
      Routes.Tokens,
      Routes.Exchanges,
      Routes.Vaults,
      Routes.Oracles,
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
          return { [route]: data.lastUpdateTimestamp };
        }
        return { [route]: null };
      })
    );

    return new Response(JSON.stringify(Object.assign({}, ...lastUpdated)), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async scheduled(event: ScheduledController, env: BaseDOEnv): Promise<void> {
    const currentMinute = new Date(event.scheduledTime).getMinutes();

    if (currentMinute % 10 === 0) {
      // Run these refreshes every 10 minutes
      await Promise.all([
        refreshRegistry(env, Routes.Configuration, Servers.ConfigurationServer),
        refreshRegistry(env, Routes.Tokens, Servers.TokenRegistryServer),
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
