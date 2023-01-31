import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv, SentinalRequest } from './types';
import { unique } from '@notional-finance/helpers';

export class AccountsDO {
  state: DurableObjectState;
  env: APIEnv;

  constructor(state: DurableObjectState, env: APIEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const req = request.clone();
      const { method } = request;
      if (method !== 'POST' && method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      if (method === 'POST') {
        return this.update(req);
      } else if (method === 'GET') {
        return this.get(req);
      }
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.log(error);
      return new Response((error as Error).message, { status: 400 });
    }
  }

  async update(request: Request) {
    try {
      const { events }: SentinalRequest = await request.json();
      if (events && events.length > 0) {
        const { id, network } = events[0].sentinel;
        if (id !== this.env.SENTINEL_ID) {
          return new Response('Bad Request', { status: 400 });
        }
        const accounts = unique(events.map((e) => e.transaction.from));
        const existingAccounts =
          (await this.state.storage.get<string[]>(network)) ?? [];
        if (network && accounts) {
          const newAccts = (accounts as string[]).filter(
            (a: string) => !existingAccounts.includes(a)
          );
          existingAccounts.push(...newAccts);
          await this.state.storage.put(network, existingAccounts);
          return new Response('Accounts Updated', {
            status: 200,
            statusText: 'OK',
          });
        }
      }
      return new Response('No New Accounts', {
        status: 200,
        statusText: 'OK',
      });
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }

  async get(request: Request) {
    try {
      const { url } = request;
      const network = new URL(url).searchParams.get('network');
      if (!network) {
        return new Response('Network Required', { status: 400 });
      }
      const existingAccounts =
        (await this.state.storage.get<string[]>(network)) ?? [];
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
