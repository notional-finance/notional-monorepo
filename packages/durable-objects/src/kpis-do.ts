import { DurableObjectState } from '@cloudflare/workers-types';
import { BaseDO } from './base-do';
import { APIEnv } from './types';

export class KPIsDO extends BaseDO {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env);
  }

  public isValidPath(path: string): boolean {
    return path === '/kpis';
  }

  public getStorageKey(url: URL): string {
    const network = url.searchParams.get('network');
    if (!network) throw Error('Network Not Found');
    return network;
  }
}
