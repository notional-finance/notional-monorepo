import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from '.';
import { BaseDO } from './abstract';
import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { AccountFetchMode, Registry } from '@notional-finance/core-entities';

export class YieldRegistryDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'yields', ONE_MINUTE_MS / 4);
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    return `${this.serviceName}/${network}`;
  }

  override async parseData(data: string) {
    console.log(data);
    return this.parseGzip(data);
  }

  async onRefresh() {
    try {
      Registry.initialize(
        this.env.NX_DATA_URL,
        AccountFetchMode.SINGLE_ACCOUNT_DIRECT
      );

      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map((network) => {
          if (network === Network.All) return Promise.resolve();

          return new Promise<void>((resolve) => {
            Registry.startRefresh(network);
            setTimeout(() => {
              console.log('Yield Registry Timeout');
              resolve();
            }, 10_000);

            Registry.onNetworkReady(network, () => {
              const yields = Registry.getYieldRegistry();
              yields.triggerRefresh(network, 0, () => {
                const data = yields.getAllYields(network);
                this.encodeGzip(JSON.stringify(data))
                  .then((gz) => {
                    return this.state.storage.put(
                      `${this.serviceName}/${network}`,
                      gz
                    );
                  })
                  .then(() => {
                    Registry.stopRefresh(network);
                    resolve();
                  });
              });
            });
          });
        })
      );
    } catch (error) {
      console.log(this.serviceName, error);
      this.logger.log({
        level: 'error',
        message: (error as Error).toString(),
      });
    }
  }
}
