import { Network } from '@notional-finance/util';
import { RegistryClientDO } from './registry-client-do';
export { RegistryClientDO } from './registry-client-do';

export interface Env {
  REGISTRY_CLIENT_DO: DurableObjectNamespace;
  VERSION: string;
  NX_ENV: string;
  NX_REGISTRY_URL: string;
  NX_COMMIT_REF: string;
  NX_DD_API_KEY: string;
  NX_SUBGRAPH_API_KEY: string;
  SUPPORTED_NETWORKS: Network[];
  VIEW_CACHE_R2: R2Bucket;
  AUTH_KEY: string;
  RISK_QUEUE: Queue;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (request.url.endsWith('/healthcheck') && authKey !== env.AUTH_KEY) {
      return new Response(null, { status: 401 });
    }
    const stub = env.REGISTRY_CLIENT_DO.get(
      env.REGISTRY_CLIENT_DO.idFromName(env.VERSION)
    );
    return stub.fetch(request);
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    const stub = env.REGISTRY_CLIENT_DO.get(
      env.REGISTRY_CLIENT_DO.idFromName(env.VERSION)
    ) as unknown as RegistryClientDO;
    await stub.healthcheck();
  },
};
