import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from '.';
import { BaseDO } from './abstract';

export class KPIsDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'kpis');
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
