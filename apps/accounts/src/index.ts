import { Network } from '@notional-finance/util';
export { RegistryClientDO } from './registry-client-do';

export interface Env {
  REGISTRY_CLIENT_DO: DurableObjectNamespace;
  VERSION: string;
  NX_ENV: string;
  NX_DATA_URL: string;
  NX_COMMIT_REF: string;
  NX_DD_API_KEY: string;
  SUPPORTED_NETWORKS: Network[];
  ACCOUNTS_CACHE_R2: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const stub = env.REGISTRY_CLIENT_DO.get(
      env.REGISTRY_CLIENT_DO.idFromName(env.VERSION)
    );
    await stub.fetch('http://hostname/healthcheck');
    return stub.fetch(request);
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    const stub = env.REGISTRY_CLIENT_DO.get(
      env.REGISTRY_CLIENT_DO.idFromName(env.VERSION)
    );
    await stub.fetch('http://hostname/healthcheck');
  },
};
