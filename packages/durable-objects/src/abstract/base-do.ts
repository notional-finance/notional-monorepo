import { BaseDOEnv } from '.';
import { Logger } from '../logger';
import zlib from 'zlib';

export abstract class BaseDO<E extends BaseDOEnv> {
  logger: Logger;

  constructor(
    public env: E,
    public serviceName: string,
    public alarmCadenceMS?: number
  ) {
    const version = `${env.NX_COMMIT_REF?.substring(0, 8) ?? 'local'}`;
    this.logger = new Logger({
      service: serviceName,
      version: version,
      env: env.NX_ENV,
      apiKey: env.NX_DD_API_KEY,
    });
  }

  async getDataKey(key: string) {
    return this.env.VIEW_CACHE_R2.get(key)
      .then((d) => d?.text())
      .then((d) => (d ? this.parseGzip(d) : '{}'));
  }

  async putStorageKey(key: string, data: string) {
    const gz = await this.encodeGzip(data);
    await this.env.VIEW_CACHE_R2.put(key, gz);
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
}
