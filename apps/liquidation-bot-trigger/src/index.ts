import {
  DATA_SERVICE_URL,
  DataServiceEndpoints,
  Network,
  ZERO_ADDRESS,
} from '@notional-finance/util';

type Env = {
  ACCOUNTS_KV: KVNamespace;
  NETWORKS: Network[];
  DATA_SERVICE_AUTH_TOKEN: string;
  LIQUIDATOR_BOT_AUTH_KEY: string;
};
const MAX_BATCH_SIZE = 1000;

async function processNetwork(env: Env, network: Network) {
  console.log(`Processing ${network}`);
  const accounts = await fetch(
    `${DATA_SERVICE_URL}/${DataServiceEndpoints.ACCOUNTS}?network=${network}`,
    {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    }
  )
    .then((r) => r.json() as Promise<{ account_id: string }[]>)
    .then((r) => r.map((a) => a.account_id))
    .then((r) => r.filter((a) => a !== ZERO_ADDRESS));

  if (!accounts.length) {
    console.log(`No accounts found for ${network}`);
    return;
  }
  await env.ACCOUNTS_KV.put(network, JSON.stringify(accounts), {
    expirationTtl: 5 * 60, // 5 minutes
  });

  await Promise.allSettled(
    // trigger liquidation-bot for each batch
    [...Array(Math.floor(accounts.length / MAX_BATCH_SIZE + 1))].map((_, i) => {
      return fetch(
        `https://${network}.liquidator.notional.finance/trigger?skip=${
          i * MAX_BATCH_SIZE
        }`,
        {
          headers: {
            'x-auth-key': env.LIQUIDATOR_BOT_AUTH_KEY,
          },
        }
      );
    })
  );
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    // no need to report errors, they will be reported by the liquidation-bot
    await Promise.allSettled(
      env.NETWORKS.map((network) => processNetwork(env, network))
    );
    return new Response('OK');
  },
  async scheduled(_: ScheduledController, env: Env) {
    // no need to report errors, they will be reported by the liquidation-bot
    await Promise.allSettled(
      env.NETWORKS.map((network) => processNetwork(env, network))
    );
  },
};
