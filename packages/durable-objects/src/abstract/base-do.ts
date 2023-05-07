import { DurableObjectState } from '@cloudflare/workers-types';
import { BaseDOEnv } from '.';
import { Logger } from '@notional-finance/logging';

export abstract class BaseDO<E extends BaseDOEnv> {
  state: DurableObjectState;
  env: E;
  logger: Logger;

  constructor(state: DurableObjectState, env: E) {
    this.state = state;
    this.env = env;

    const version = `${env.NX_COMMIT_REF?.substring(0, 8) ?? 'local'}`;
    this.logger = new Logger({
      service: env.SERVICE_NAME,
      version: version,
      env: env.NX_ENV,
      apiKey: env.NX_DD_API_KEY,
    });
  }

  abstract getStorageKey(url: URL): string;
  abstract isValidPath(path: string): boolean;
  abstract onRefresh(): Promise<void>;

  async healthcheck(): Promise<Response> {
    if (this.env.ALARM_CADENCE_MS) {
      const currentAlarm = await this.state.storage.getAlarm();
      const currentMillis = Date.now();
      if (currentAlarm == null || currentAlarm < currentMillis) {
        await this.alarm();
      }

      return new Response('Alarm Scheduled', { status: 200, statusText: 'OK' });
    }

    return new Response('OK', { status: 200, statusText: 'OK' });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/healthcheck') {
      return this.healthcheck();
    }

    if (!this.isValidPath(url.pathname)) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const storageKey = this.getStorageKey(url);

      // Only accept get requests
      if (request.method === 'GET') {
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

  async alarm() {
    if (!this.env.ALARM_CADENCE_MS) return;
    await this.onRefresh();
    await this.state.storage.setAlarm(Date.now() + this.env.ALARM_CADENCE_MS);
  }
}
