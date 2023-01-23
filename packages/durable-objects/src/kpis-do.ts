import { DurableObjectState } from '@cloudflare/workers-types';
import { KPIsDOEnv } from './types';

export class KPIsDO {
  state: DurableObjectState;
  env: KPIsDOEnv;

  constructor(state: DurableObjectState, env: KPIsDOEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const req = request.clone();
    const { url: requestUrl, method } = request;
    const url = new URL(requestUrl);
    const network = url.searchParams.get('network');
    const path = url.pathname;
    if (!network) {
      return new Response('Network Required', { status: 400 });
    }
    if (path === '/kpis' && method === 'PUT') {
      return this.update(network, req);
    } else if (path === '/kpis' && method === 'GET') {
      return this.get(network);
    }
    return new Response('Not Found', { status: 404 });
  }

  async update(network: string, request: Request) {
    try {
      const req = await request.json();
      const { kpis } = req;
      await this.state.storage.put(network, kpis);
      return new Response('KPIs Updated', { status: 200, statusText: 'OK' });
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }

  async get(network: string | null) {
    try {
      const kpis = await this.state.storage.get(network);
      const headers = {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      };
      if (!kpis) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(JSON.stringify(kpis), {
        status: 200,
        headers,
      });
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }
}
