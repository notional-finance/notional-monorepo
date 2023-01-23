import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { ExchangeRatesDO, KPIsDO } from '@notional-finance/durable-objects';
export { ExchangeRatesDO, KPIsDO };
export interface APIEnv {
  EXCHANGE_RATES_DO: DurableObjectNamespace;
  KPIS_DO: DurableObjectNamespace;
  EXCHANGE_RATES_NAME: string;
  KPIS_NAME: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: APIEnv): Promise<Response> {
    const req = request.clone();
    const { url, method, headers } = request;
    const path = new URL(url).pathname;
    if (method !== 'GET' && method !== 'OPTIONS') {
      return new Response('Not Found', { status: 404 });
    }
    if (method === 'OPTIONS') {
      if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
      ) {
        const respHeaders = {
          ...corsHeaders,
          'Access-Control-Allow-Headers': headers.get(
            'Access-Control-Request-Headers'
          ),
        };
        return new Response(null, { headers: respHeaders });
      }

      return new Response(null, {
        headers: {
          Allow: 'GET, OPTIONS',
        },
      });
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
