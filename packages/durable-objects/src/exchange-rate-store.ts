import {
  DurableObjectState,
  DurableObjectNamespace,
} from '@cloudflare/workers-types';
import { GetExchangeRatesResponse } from './types';

export interface ExchangeRatesEnv {
  EXCHANGE_RATE_STORE: DurableObjectNamespace;
  WORKER_NAME: string;
}
export class ExchangeRateStore {
  state: DurableObjectState;
  env: ExchangeRatesEnv;

  constructor(state: DurableObjectState, env: ExchangeRatesEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/exchange-rates' && method === 'PUT') {
      return this.update(request);
    } else if (path === '/exchange-rates' && method === 'GET') {
      const network = url.searchParams.get('network');
      return this.get(network);
    }
    return new Response('Not Found', { status: 404 });
  }

  async update(request: Request) {
    try {
      const req = await request.json();
      const { rates } = req;
      await this.state.storage.put(rates.network, rates);
      return new Response('Rates Updated', { status: 200, statusText: 'OK' });
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }

  async get(network: string | null) {
    try {
      if (network && typeof network === 'string') {
        const rates = await this.state.storage.get(network);
        const headers = { 'content-type': 'application/json' };
        const response = new Response(JSON.stringify(rates ?? {}), {
          status: 200,
          headers,
        });
        return response;
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }
}
