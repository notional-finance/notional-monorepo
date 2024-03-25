import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv } from '.';
import { BaseDO } from './abstract';
import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { GraphDocument, Servers } from '@notional-finance/core-entities';

export class ViewsDO extends BaseDO<APIEnv> {
  protected analytics: InstanceType<typeof Servers.AnalyticsServer>;

  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'views', ONE_MINUTE_MS * 60);
    this.analytics = new Servers.AnalyticsServer(
      env.DATA_SERVICE_URL,
      env.DATA_SERVICE_AUTH_TOKEN
    );
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

  async fetchDBView(network: Network, name: string) {
    const data = JSON.stringify(await this.analytics.fetchView(network, name));
    const key = `${this.serviceName}/${network}/${name}`;
    return this.putStorageKey(key, data);
  }

  async fetchAllDBViews(network: Network) {
    const resp = await fetch(
      `${this.env.DATA_SERVICE_URL}/views?network=${network}`,
      {
        headers: {
          'x-auth-token': this.env.DATA_SERVICE_AUTH_TOKEN,
        },
      }
    );
    const data = (await resp.json()) as { view_name: string }[];
    await Promise.all(data.map((v) => this.fetchDBView(network, v.view_name)));
  }

  async fetchGraphDocument(network: Network, doc: GraphDocument) {
    const { data } = await this.analytics.fetchGraphDocument(network, doc, {});
    const key = `${this.serviceName}/${network}/${doc.replace('Document', '')}`;
    if (data) return this.putStorageKey(key, JSON.stringify(data));
  }

  async fetchAllGraphViews(network: Network) {
    if (network === Network.all) return;

    const documents = ['ExternalLendingHistoryDocument'] as GraphDocument[];
    await Promise.all(
      documents.map((d) => this.fetchGraphDocument(network, d))
    );
  }

  async onRefresh() {
    await Promise.all(
      this.env.SUPPORTED_NETWORKS.flatMap((network) => {
        return [
          this.fetchAllDBViews(network),
          this.fetchAllGraphViews(network),
          this.analytics
            .refresh(network)
            .then(() => {
              console.log('Wrote analytics data for ', network);
              this.putStorageKey(
                `${this.serviceName}/${network}/analytics`,
                this.analytics.serializeToJSON(network)
              );
            })
            .catch((e) => {
              console.log('error', e);
            }),
        ];
      })
    );
  }
}
