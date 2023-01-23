import { DurableObjectState } from '@cloudflare/workers-types';
import { ExchangeRatesDOEnv } from './types';

export class ExchangeRatesDO {
  state: DurableObjectState;
  env: ExchangeRatesDOEnv;

  constructor(state: DurableObjectState, env: ExchangeRatesDOEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const req = request.clone();
      const { url: requestUrl, method } = request;
      const url = new URL(requestUrl);
      const path = url.pathname;
      if (path === '/exchange-rates' && method === 'PUT') {
        return this.update(req);
      } else if (path === '/exchange-rates' && method === 'GET') {
        const network = url.searchParams.get('network');
        if (!network) {
          return new Response('Network Required', { status: 400 });
        }
        return this.get(network);
      }
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.log(error);
      return new Response((error as Error).message, { status: 400 });
    }
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
      const rates = await this.state.storage.get(network);
      const headers = {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      };
      if (!rates) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(JSON.stringify(rates), {
        status: 200,
        headers,
      });
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }
}
