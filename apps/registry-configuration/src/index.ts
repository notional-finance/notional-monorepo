import { Request } from '@cloudflare/workers-types';
import {
  BaseDOEnv,
  refreshRegistry,
  Servers,
} from '@notional-finance/durable-objects';

export default {
  async fetch(_: Request, env: BaseDOEnv): Promise<Response> {
    return refreshRegistry(
      env,
      'configuration',
      Servers.ConfigurationServer
    ).then(() => new Response('OK'));
  },
  async scheduled(_: ScheduledController, env: BaseDOEnv): Promise<void> {
    return refreshRegistry(env, 'configuration', Servers.ConfigurationServer);
  },
};
