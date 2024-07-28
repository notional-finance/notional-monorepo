import { Request } from '@cloudflare/workers-types';
import {
  BaseDOEnv,
  ConfigurationRegistryDO,
} from '@notional-finance/durable-objects';

const run = async (env: BaseDOEnv) => {
  const c = new ConfigurationRegistryDO(env);
  await c.onRefresh();
};

export default {
  async fetch(_: Request, env: BaseDOEnv): Promise<Response> {
    return run(env).then(() => new Response('OK'));
  },
  async scheduled(_: ScheduledController, env: BaseDOEnv): Promise<void> {
    return run(env);
  },
};
