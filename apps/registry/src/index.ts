import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { RegistryDOEnv } from '@notional-finance/durable-objects';
import { Routes, Servers } from '@notional-finance/core-entities/src/server';
import { Network } from '@notional-finance/util';

// Exports durable objects so migrations can be run
export {
  TokenRegistryDO,
  ConfigurationRegistryDO,
  ExchangeRegistryDO,
  OracleRegistryDO,
  VaultRegistryDO,
} from '@notional-finance/durable-objects';

async function runHealthCheck(ns: DurableObjectNamespace, version: string) {
  const stub = ns.get(ns.idFromName(version));
  await stub.fetch('http://hostname/healthcheck');
}

export default {
  async fetch(request: Request, env: RegistryDOEnv): Promise<Response> {
    const url = new URL(request.url);

    const blockNumberStr = url.searchParams.get('blockNumber');
    if (blockNumberStr && blockNumberStr !== '') {
      const network = url.searchParams.get('network') as Network;
      const blockNumber = parseInt(blockNumberStr);
      const server = new Servers.OracleRegistryServer();
      const data = await server.refreshAtBlock(network as Network, blockNumber);
      return new Response(JSON.stringify(data), { status: 200 });
    }

    // Run a healthcheck against all of the durable objects.
    await Promise.all([
      runHealthCheck(env.TOKEN_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.CONFIGURATION_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.EXCHANGE_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.ORACLE_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.VAULT_REGISTRY_DO, env.VERSION),
    ]);

    let ns: DurableObjectNamespace;
    switch (url.pathname.slice(1)) {
      case Routes.Tokens:
        ns = env.TOKEN_REGISTRY_DO;
        break;
      case Routes.Oracles:
        ns = env.ORACLE_REGISTRY_DO;
        break;
      case Routes.Configuration:
        ns = env.CONFIGURATION_REGISTRY_DO;
        break;
      case Routes.Exchanges:
        ns = env.EXCHANGE_REGISTRY_DO;
        break;
      case Routes.Vaults:
        ns = env.VAULT_REGISTRY_DO;
        break;
    }

    const stub = ns.get(ns.idFromName(env.VERSION));
    return stub.fetch(request);
  },
  async scheduled(_: ScheduledController, env: RegistryDOEnv): Promise<void> {
    // Run a healthcheck against all of the durable objects.
    await Promise.all([
      runHealthCheck(env.TOKEN_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.CONFIGURATION_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.EXCHANGE_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.ORACLE_REGISTRY_DO, env.VERSION),
      runHealthCheck(env.VAULT_REGISTRY_DO, env.VERSION),
    ]);
  },
};
