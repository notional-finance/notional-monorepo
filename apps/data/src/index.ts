import { DurableObjectNamespace, Request } from '@cloudflare/workers-types';
import { RegistryDOEnv } from '@notional-finance/durable-objects';
import { Network } from '@notional-finance/util';
import { Servers, Routes } from '@notional-finance/core-entities';

export interface Env extends RegistryDOEnv {
  VIEWS_DO: DurableObjectNamespace;
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  NX_SUBGRAPH_API_KEY: string;
}

export { ViewsDO } from '@notional-finance/durable-objects';

async function getOracleData(env: Env, network: Network, blockNumber: number) {
  const server = new Servers.OracleRegistryServer(env);
  await server.refreshAtBlock(network, blockNumber);
  return server.serializeToJSON(network);
}

async function getTokenData(env: Env, network: Network, blockNumber: number) {
  const server = new Servers.TokenRegistryServer(env);
  await server.refreshAtBlock(network, blockNumber);
  return server.serializeToJSON(network);
}

async function getExchangeData(env: Env, network: Network, blockNumber: number) {
  const server = new Servers.ExchangeRegistryServer(env);
  await server.refreshAtBlock(network, blockNumber);
  return server.serializeToJSON(network);
}

async function getConfigurationData(env: Env, network: Network, blockNumber: number) {
  const server = new Servers.ConfigurationServer(env);
  await server.refreshAtBlock(network, blockNumber);
  return server.serializeToJSON(network);
}

async function getVaultData(env: Env, network: Network, blockNumber: number) {
  const server = new Servers.VaultRegistryServer(env);
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
      case Routes.Oracles: {
        const blockNumber = url.pathname.split('/')[3];
        if (!blockNumber) {
          throw Error('Block number is required');
        }
        const data = await getOracleData(
          env,
          network as Network,
          parseInt(blockNumber)
        );
        return new Response(data, {
          status: 200,
          statusText: 'OK',
        });
      }
      case Routes.Tokens: {
        const blockNumber = url.pathname.split('/')[3];
        if (!blockNumber) {
          throw Error('Block number is required');
        }
        const data = await getTokenData(
          env,
          network as Network,
          parseInt(blockNumber)
        );
        return new Response(data, {
          status: 200,
          statusText: 'OK',
        });
      }
      case Routes.Exchanges: {
        const blockNumber = url.pathname.split('/')[3];
        if (!blockNumber) {
          throw Error('Block number is required');
        }
        const data = await getExchangeData(
          env,
          network as Network,
          parseInt(blockNumber)
        );
        return new Response(data, {
          status: 200,
          statusText: 'OK',
        });
      }
      case Routes.Configuration: {
        const blockNumber = url.pathname.split('/')[3];
        if (!blockNumber) {
          throw Error('Block number is required');
        }
        const data = await getConfigurationData(
          env,
          network as Network,
          parseInt(blockNumber)
        );
        return new Response(data, {
          status: 200,
          statusText: 'OK',
        });
      }
      case Routes.Vaults: {
        const blockNumber = url.pathname.split('/')[3];
        if (!blockNumber) {
          throw Error('Block number is required');
        }
        const data = await getVaultData(
          env,
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

    await fetch(`${env.DATA_SERVICE_URL}/syncOracleData`, {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    });

    for (const network of env.SUPPORTED_NETWORKS) {
      await fetch(`${env.DATA_SERVICE_URL}/syncAccounts?network=${network}`, {
        headers: {
          'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
        },
      });

      await fetch(
        `${env.DATA_SERVICE_URL}/syncVaultAccounts?network=${network}`,
        {
          headers: {
            'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
          },
        }
      );
    }
  },
};
