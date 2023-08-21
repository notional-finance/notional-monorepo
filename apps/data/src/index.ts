import {
  DurableObjectNamespace,
  Request,
  Response,
} from '@cloudflare/workers-types';
import { RegistryDOEnv } from '@notional-finance/durable-objects';
import { Routes } from '@notional-finance/core-entities/src/server';

export interface Env extends RegistryDOEnv {
  VIEWS_DO: DurableObjectNamespace;
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
}

export { ViewsDO } from '@notional-finance/durable-objects';
export { YieldRegistryDO } from '@notional-finance/durable-objects';

async function runHealthCheck(ns: DurableObjectNamespace, version: string) {
  const stub = ns.get(ns.idFromName(version));
  await stub.fetch('http://hostname/healthcheck');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    let ns: DurableObjectNamespace;
    switch (url.pathname.split('/')[2]) {
      case Routes.Yields:
        ns = env.YIELD_REGISTRY_DO;
        break;
      case Routes.Analytics:
        ns = env.VIEWS_DO;
        break;
    }

    const stub = ns.get(ns.idFromName(env.VERSION));
    return stub.fetch(request);
  },
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    await Promise.all(
      this.env.SUPPORTED_NETWORKS.map((network) =>
        fetch(
          `${env.DATA_SERVICE_URL}/backfillGenericData?network=${network}`,
          {
            headers: {
              'x-auth-token': this.env.DATA_SERVICE_AUTH_TOKEN,
            },
          }
        )
      )
    );

    // Run a healthcheck against all of the durable objects.
    await Promise.all([runHealthCheck(env.YIELD_REGISTRY_DO, env.VERSION)]);
  },
};
