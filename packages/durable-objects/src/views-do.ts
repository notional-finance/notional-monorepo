import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from '.';
import { BaseDO } from './abstract';
import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { AnalyticsServer } from '@notional-finance/core-entities/src/server';

export class ViewsDO extends BaseDO<APIEnv> {
  protected analytics: AnalyticsServer;

  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'views', ONE_MINUTE_MS * 60);
    this.analytics = new AnalyticsServer();
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    const view = url.pathname.split('/')[3];
    if (!view) throw Error('View Not Found');
    return `${this.serviceName}/${network}/${view}`;
  }

  override async getDataKey(key: string) {
    return this.env.VIEW_CACHE_R2.get(key)
      .then((d) => d?.text())
      .then((d) => (d ? this.parseGzip(d) : '{}'));
  }

  override async putStorageKey(key: string, data: string) {
    const gz = await this.encodeGzip(data);
    await this.env.VIEW_CACHE_R2.put(key, gz);
  }

  async fetchView(network: Network, name: string) {
    const resp = await fetch(
      `${this.env.DATA_SERVICE_URL}/query?network=${network}&view=${name}`,
      {
        headers: {
          'x-auth-token': this.env.DATA_SERVICE_AUTH_TOKEN,
        },
      }
    );
    const data = JSON.stringify(await resp.json());
    const key = `${this.serviceName}/${network}/${name}`;
    return this.putStorageKey(key, data);
  }

  async fetchAllViews(network: Network) {
    const resp = await fetch(
      `${this.env.DATA_SERVICE_URL}/views?network=${network}`,
      {
        headers: {
          'x-auth-token': this.env.DATA_SERVICE_AUTH_TOKEN,
        },
      }
    );
    const data = (await resp.json()) as any[];
    await Promise.all(
      data.map((v) => {
        console.log(`Fetch view ${v.view_name}`);
        return this.fetchView(network, v.view_name);
      })
    );
  }

  async onRefresh() {
    await Promise.all(
      this.env.SUPPORTED_NETWORKS.flatMap((network) => {
        const p = [this.fetchAllViews(network)];
        if (network !== Network.All) {
          p.push(
            this.analytics.refresh(network).then(() => {
              console.log('Wrote analytics data for ', network);
              this.putStorageKey(
                `${this.serviceName}/${network}/analytics`,
                this.analytics.serializeToJSON(network)
              );
            })
          );
        }

        return p;
      })
    );
  }
}
