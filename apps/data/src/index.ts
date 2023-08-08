import zlib from 'zlib';

export interface Env {
  VIEWS_DO: DurableObjectNamespace;
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
}

export { ViewsDO } from '@notional-finance/durable-objects';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.VIEWS_DO.idFromName('VIEWS_DO');
    const stub = env.VIEWS_DO.get(id);

    return stub.fetch(request);
  },
  async scheduled(): Promise<void> {
    console.log('Scheduled');
  },
};
