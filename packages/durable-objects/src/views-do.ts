import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from '.';
import { BaseDO } from './abstract';
import { Network, ONE_MINUTE_MS } from '@notional-finance/util';

export class ViewsDO {
  state: DurableObjectState;
  env: APIEnv;

  constructor(state: DurableObjectState, env: APIEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    console.log(request.url);
    console.log(this.env.DATA_SERVICE_URL);
    return new Response('Hello world');
  }

  async update(request: Request) {}

  private getStorageKey(network: string, view: string) {
    return `${network}/${view}}`;
  }

  async get(request: Request) {
    try {
      const { url } = request;
      const network = new URL(url).searchParams.get('network');
      if (!network) {
        return new Response('Network Required', { status: 400 });
      }
      const view = new URL(url).searchParams.get('view');
      if (!view) {
        return new Response('View Required', { status: 400 });
      }
      const existingAccounts =
        (await this.state.storage.get<string[]>(
          this.getStorageKey(network, view)
        )) ?? [];
      const headers = {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      };
      return new Response(
        JSON.stringify({ accounts: existingAccounts, network }),
        {
          status: 200,
          headers,
        }
      );
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }
}
