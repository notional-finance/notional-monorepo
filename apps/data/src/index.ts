import { DurableObjectNamespace, Request } from '@cloudflare/workers-types';
import { Network } from '@notional-finance/util';
import { Routes } from '@notional-finance/core-entities';

export interface Env {
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  NX_SUBGRAPH_API_KEY: string;
}

export default {
  async fetch(_request: Request, _env: Env) {},
  async scheduled(_: ScheduledController, _env: Env): Promise<void> {
    // await fetch(`${env.DATA_SERVICE_URL}/syncGenericData`, {
    //   headers: {
    //     'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    //   },
    // });
    // await fetch(`${env.DATA_SERVICE_URL}/syncOracleData`, {
    //   headers: {
    //     'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    //   },
    // });
    // for (const network of env.SUPPORTED_NETWORKS) {
    //   await fetch(`${env.DATA_SERVICE_URL}/syncAccounts?network=${network}`, {
    //     headers: {
    //       'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    //     },
    //   });
    //   await fetch(
    //     `${env.DATA_SERVICE_URL}/syncVaultAccounts?network=${network}`,
    //     {
    //       headers: {
    //         'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
    //       },
    //     }
    //   );
    // }
  },
};
