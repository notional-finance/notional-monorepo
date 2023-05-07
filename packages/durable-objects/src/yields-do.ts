import { DurableObjectState } from '@cloudflare/workers-types';
import { BaseDO, APIEnv } from './abstract';

export class YieldsDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env);
  }

  isValidPath(path: string): boolean {
    return path === '/yields';
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
