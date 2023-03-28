import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from './types';

export abstract class BaseDO {
  state: DurableObjectState;
  env: APIEnv;

  constructor(state: DurableObjectState, env: APIEnv) {
    this.state = state;
    this.env = env;
  }

  public abstract getStorageKey(url: URL): string;
  public abstract isValidPath(path: string): boolean;

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (!this.isValidPath(url.pathname)) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const storageKey = this.getStorageKey(url);

      if (request.method === 'PUT') {
        const data = await request.json();
        await this.state.storage.put(storageKey, data);
        return new Response('Updated', { status: 200 });
      } else if (request.method === 'GET') {
        const data = await this.state.storage.get(storageKey);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {
      return new Response((e as Error).toString(), { status: 500 });
    }

    return new Response('Not Found', { status: 404 });
  }
}
