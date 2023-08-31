export { RegistryClientDO } from './registry-client-do';

interface Env {
  REGISTRY_CLIENT_DO: DurableObjectNamespace;
  VERSION: string;
  NX_ENV: string;
  NX_DATA_URL: string;
  NX_DD_API_KEY: string;
  SUPPORTED_NETWORKS: string[];
}

export default {
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
