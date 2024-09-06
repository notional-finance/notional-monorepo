import { Logger } from '@notional-finance/util';
import { BaseDOEnv } from '.';

export function createLogger(env: BaseDOEnv, serviceName: string): Logger {
  const version = `${env.NX_COMMIT_REF?.substring(0, 8) ?? 'local'}`;
  return new Logger({
    service: serviceName,
    version: version,
    env: env.NX_ENV,
    apiKey: env.NX_DD_API_KEY,
  });
}

export async function putStorageKey(env: BaseDOEnv, key: string, data: string) {
  await env.VIEW_CACHE_R2.put(key, data);
}
