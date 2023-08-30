import { DurableObjectState } from '@cloudflare/workers-types';
import { BaseDOEnv } from '.';
import { Logger } from '@notional-finance/logging';
import zlib from 'zlib';

export abstract class BaseDO<E extends BaseDOEnv> {
  state: DurableObjectState;
  env: E;
  logger: Logger;

  constructor(
    state: DurableObjectState,
    env: E,
    public serviceName: string,
    public alarmCadenceMS?: number
  ) {
    this.state = state;
    this.env = env;

    this.state.blockConcurrencyWhile(async () => {
      if (alarmCadenceMS) {
        // Set the initial alarm to run almost immediately, note that this does not get
        // triggered until some scheduled run or fetch that will instantiate the object
        await this.state.storage.setAlarm(Date.now() + 500);
      }
    });

    const version = `${env.NX_COMMIT_REF?.substring(0, 8) ?? 'local'}`;
    this.logger = new Logger({
      service: serviceName,
      version: version,
      env: env.NX_ENV,
      apiKey: env.NX_DD_API_KEY,
    });
  }

  abstract getStorageKey(url: URL): string;
  abstract onRefresh(): Promise<void>;

  async encodeGzip(data: string) {
    return await new Promise<string>((resolve, reject) => {
      zlib.gzip(Buffer.from(data, 'utf-8'), (err, result) => {
        if (err) reject(err);
        resolve(result.toString('base64'));
      });
    });
  }

  async parseGzip(data: string) {
    try {
      const unzipped = await new Promise<string>((resolve, reject) => {
        zlib.unzip(Buffer.from(data, 'base64'), (err, result) => {
          if (err) reject(err);
          resolve(result.toString('utf-8'));
        });
      });
      return JSON.parse(unzipped.toString() || '{}');
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  // TODO: override this to allow data to store into R2

  async parseData(data: any) {
    return data;
  }

  async healthcheck(): Promise<Response> {
    if (this.alarmCadenceMS) {
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

    try {
      const storageKey = this.getStorageKey(url);

      // Only accept get requests
      if (request.method === 'GET') {
        const data = await this.parseData(
          await this.state.storage.get(storageKey)
        );
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
    if (!this.alarmCadenceMS) return;
    await this.onRefresh();
    await this.state.storage.setAlarm(Date.now() + this.alarmCadenceMS);
  }
}
