import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { ExchangeRatesDO, KPIsDO } from '@notional-finance/durable-objects';
export { ExchangeRatesDO, KPIsDO };
export interface APIEnv {
  EXCHANGE_RATES_DO: DurableObjectNamespace;
  KPIS_DO: DurableObjectNamespace;
  EXCHANGE_RATES_NAME: string;
  KPIS_NAME: string;
}
export default {
  async fetch(request: Request, env: APIEnv): Promise<Response> {
    const req = request.clone();
    const { url } = request;
    const path = new URL(url).pathname;
    if (request.method !== 'GET') {
      return new Response('Not Found', { status: 404 });
    }
    if (path === '/exchange-rates') {
      const id = env.EXCHANGE_RATES_DO.idFromName(env.EXCHANGE_RATES_NAME);
      const stub = env.EXCHANGE_RATES_DO.get(id);
      return stub.fetch(req);
    } else if (path === '/kpis') {
      const id = env.KPIS_DO.idFromName(env.KPIS_NAME);
      const stub = env.KPIS_DO.get(id);
      return stub.fetch(req);
    }
    return new Response('Not Found', { status: 404 });
  },
};
