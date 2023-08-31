import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv, BaseDO } from '../../../packages/durable-objects/src';
import { Network } from '@notional-finance/util';
import { AccountFetchMode, Registry } from '@notional-finance/core-entities';

export class RegistryClientDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'registry-client');
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    return `${this.serviceName}/${network}`;
  }

  async onRefresh() {
    try {
      Registry.initialize(
        this.env.NX_DATA_URL,
        AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
        false
      );

      // First trigger a refresh for all supported networks
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map((network) => {
          if (network === Network.All) return Promise.resolve();
          return Registry.triggerRefresh(network);
        })
      );

      // Now run all metrics jobs
    } catch (error) {
      console.log(this.serviceName, error);
      this.logger.log({
        level: 'error',
        message: (error as Error).toString(),
      });
    }
  }
}
