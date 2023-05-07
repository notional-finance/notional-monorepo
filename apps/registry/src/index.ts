import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { APIEnv } from '@notional-finance/durable-objects';

async function runHealthCheck(ns: DurableObjectNamespace, version: string) {
  const stub = ns.get(ns.idFromName(version));
  await stub.fetch('http://hostname/healthcheck');
}

export default {
  async fetch(): Promise<Response> {
    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  },
  async scheduled(_: ScheduledController, env: APIEnv): Promise<void> {
    // Run a healthcheck against all of the durable objects.
    await Promise.all([
      runHealthCheck(env.TOKEN_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.CONFIGURATION_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.EXCHANGE_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.ORACLE_REGISTRY_DO, env.VERSION),
    ]);
  },
};
