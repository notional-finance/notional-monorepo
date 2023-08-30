import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from '.';
import { BaseDO } from './abstract';
import { Network, ONE_MINUTE_MS } from '@notional-finance/util';

export class ViewsDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'views', ONE_MINUTE_MS * 60);
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    const view = url.pathname.split('/')[3];
    if (!view) throw Error('View Not Found');
    return `${this.serviceName}/${network}/${view}`;
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
    const data = await resp.json();
    return this.state.storage.put(
      `${this.serviceName}/${network}/${name}`,
      await this.encodeGzip(JSON.stringify(data))
    );
  }

  override async parseData(data: string) {
    return this.parseGzip(data);
  }

  async listViews(network: Network) {
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
      this.env.SUPPORTED_NETWORKS.map((network) => {
        if (network === Network.All) return Promise.resolve();

        return this.listViews(network);
      })
    );
  }
}
