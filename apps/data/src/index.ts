import { DurableObjectNamespace, Request } from '@cloudflare/workers-types';
import { RegistryDOEnv } from '@notional-finance/durable-objects';
import { Routes } from '@notional-finance/core-entities/src/server';
import { Network, ONE_HOUR_MS } from '@notional-finance/util';
import { OracleRegistryServer } from 'packages/core-entities/src/server/oracle-registry-server';

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

async function getOracleData(network: Network, blockNumber: number) {
  const server = new OracleRegistryServer();
  await server.refreshAtBlock(network, blockNumber);
  return server.serializeToJSON(network);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const network = url.pathname.split('/')[1];
    if (!network) {
      throw Error('Network is required');
    }

    let ns: DurableObjectNamespace;
    switch (url.pathname.split('/')[2]) {
      case Routes.Yields:
        ns = env.YIELD_REGISTRY_DO;
        break;
      case Routes.Oracles: {
        const blockNumber = url.pathname.split('/')[3];
        if (!blockNumber) {
          throw Error('Block number is required');
        }
        const data = await getOracleData(
          network as Network,
          parseInt(blockNumber)
        );
        return new Response(data, {
          status: 200,
          statusText: 'OK',
        });
      }
      case Routes.Analytics:
        ns = env.VIEWS_DO;
        break;
      default:
        throw Error('Bad route');
    }

    const stub = ns.get(ns.idFromName(env.VERSION));
    return stub.fetch(request);
  },
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    await fetch(`${env.DATA_SERVICE_URL}/syncGenericData`, {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    });

    // Run a healthcheck against all of the durable objects.
    await Promise.all([runHealthCheck(env.YIELD_REGISTRY_DO, env.VERSION)]);
  },
};
