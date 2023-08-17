import {
  DurableObjectNamespace,
  Request,
  Response,
} from '@cloudflare/workers-types';
import { RegistryDOEnv } from '@notional-finance/durable-objects';
import { Routes } from '@notional-finance/core-entities/src/server';

// Exports durable objects so migrations can be run
export { ExchangeRegistryDO } from '@notional-finance/durable-objects';

async function runHealthCheck(ns: DurableObjectNamespace, version: string) {
  const stub = ns.get(ns.idFromName(version));
  await stub.fetch('http://hostname/healthcheck');
}

export default {
  async fetch(request: Request, env: RegistryDOEnv): Promise<Response> {
    const url = new URL(request.url);

    let ns: DurableObjectNamespace;
    switch (url.pathname.split('/')[2]) {
      case Routes.Exchanges:
        ns = env.EXCHANGE_REGISTRY_DO;
        break;
    }

    const stub = ns.get(ns.idFromName(env.VERSION));
    return stub.fetch(request);
  },
  async scheduled(_: ScheduledController, env: RegistryDOEnv): Promise<void> {
    // Run a healthcheck against all of the durable objects.
    await Promise.all([runHealthCheck(env.EXCHANGE_REGISTRY_DO, env.VERSION)]);
  },
};
