import { Network, getProviderFromNetwork, } from '@notional-finance/util';
import TreasuryManager from "./treasury_manager";
import { Env } from "./types";

export async function handler(env: Env) {
  const provider = getProviderFromNetwork(Network[env.NETWORK], true);

  const manager = new TreasuryManager(Network[env.NETWORK], provider, env);

  console.log(`calling manager`);
  await manager.run();
  console.log('manager run completed');
}

export default {
  async fetch(_request: Request, env: Env, _: ExecutionContext): Promise<Response> {
    await handler(env);
    return new Response('OK');
  },
  // this method can be only call by cloudflare internal system so it does not
  // require any authentication
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    await handler(env);
  },
};
