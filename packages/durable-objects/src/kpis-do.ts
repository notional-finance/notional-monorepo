import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv, BaseDO } from './abstract';

export class KPIsDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env);
  }

  isValidPath(path: string): boolean {
    return path === '/kpis';
  }

  getStorageKey(url: URL): string {
    const network = url.searchParams.get('network');
    if (!network) throw Error('Network Not Found');
    return network;
  }

  async onRefresh() {
    return;
  }
}
