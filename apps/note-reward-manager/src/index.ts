import { getProviderFromNetwork, } from '@notional-finance/util';
import TreasuryManager from "./treasury_manager";
import { Env, RunType } from "./types";

export async function handler(env: Env, runType: RunType) {
  const provider = getProviderFromNetwork(env.NETWORK, true);

  const manager = new TreasuryManager(env.NETWORK, provider, env);

  console.log(`calling manager`);
  await manager.run(runType);
  console.log('manager run completed');
}

export default {
  async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (authKey !== env.AUTH_KEY) {
      return new Response(null, { status: 401 });
    }
    await handler(env, RunType.burnNOTE);
    return new Response('OK');
  },
  // this method can be only call by cloudflare internal system so it does not
  // require any authentication
  async scheduled(_: ScheduledController, env: Env): Promise<void> {

    const currentMinuteInHour = new Date().getMinutes();
    if (currentMinuteInHour < 10) {
        await handler(env, RunType.sellCOMP);
    } else {
        await handler(env, RunType.burnNOTE);
    }
  },
};
