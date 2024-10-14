import {
  DATA_SERVICE_URL,
  DataServiceEndpoints,
  Network,
} from '@notional-finance/util';

type Env = {
  NETWORKS: Network[];
  DATA_SERVICE_AUTH_TOKEN: string;
  LIQUIDATOR_BOT_AUTH_KEY: string;
};
const MAX_BATCH_SIZE = 1000;

async function processNetwork(env: Env, network: Network) {
  console.log(`Processing ${network}`);
  const accountsLength = await fetch(
    `${DATA_SERVICE_URL}/${DataServiceEndpoints.ACCOUNTS}?network=${network}`,
    {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    }
  )
    .then((r) => r.json() as Promise<{ account_id: string }[]>)
    .then((r) => r.length);
  console.log(`${network} has ${accountsLength} accounts`);
  console.log(Math.floor(accountsLength / MAX_BATCH_SIZE + 1));

  await Promise.allSettled(
    // trigger liquidation-bot for each batch
    [...Array(Math.floor(accountsLength / MAX_BATCH_SIZE + 1))].map((_, i) => {
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
