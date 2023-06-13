import * as accounts from './accounts.json';

/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
  ACCOUNT_CACHE: DurableObjectNamespace;
}

export class AccountCache {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/refresh':
        this.state.storage.put('accounts', JSON.stringify(accounts));
        return new Response('OK', { status: 200, statusText: 'OK' });
    }
    const cachedAccounts = await this.state.storage.get<string>('accounts');
    return new Response(cachedAccounts, {
      status: 200,
      statusText: 'OK',
    });
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    const id = env.ACCOUNT_CACHE.idFromName('ACCOUNT_CACHE');
    const stub = env.ACCOUNT_CACHE.get(id);

    return await stub.fetch(request);
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    const id = env.ACCOUNT_CACHE.idFromName('ACCOUNT_CACHE');
    const stub = env.ACCOUNT_CACHE.get(id);

    await stub.fetch('/refresh');
  },
};
