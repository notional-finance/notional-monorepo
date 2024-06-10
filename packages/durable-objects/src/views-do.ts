import { DurableObjectState } from '@cloudflare/workers-types';
import { APIEnv, MetricType } from '.';
import { BaseDO } from './abstract';
import { Network, ONE_MINUTE_MS, getNowSeconds } from '@notional-finance/util';
import { Servers } from '@notional-finance/core-entities';

export class ViewsDO extends BaseDO<APIEnv> {
  protected analytics: InstanceType<typeof Servers.AnalyticsServer>;

  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'views', ONE_MINUTE_MS * 60);
    this.analytics = new Servers.AnalyticsServer(
      env.DATA_SERVICE_URL,
      env.DATA_SERVICE_AUTH_TOKEN,
      env
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
    try {
      const data = JSON.stringify(
        await this.analytics.fetchView(network, name)
      );
      const key = `${this.serviceName}/${network}/${name}`;
      return this.putStorageKey(key, data);
    } catch (e) {
      console.error(e);
    }
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

  async storeDocument(
    result: { data?: unknown },
    name: string,
    network: Network
  ) {
    const key = `${this.serviceName}/${network}/${name}`;
    if (result['data'])
      return this.putStorageKey(key, JSON.stringify(result['data']));
  }

  async fetchAllGraphViews(network: Network) {
    if (network === Network.all) return;

    await Promise.all([
      this.analytics
        .fetchGraphDocument(network, 'ExternalLendingHistoryDocument')
        .then((d) => this.storeDocument(d, 'ExternalLendingHistory', network)),
      this.analytics
        .fetchGraphDocument(network, 'MetaDocument')
        .then((d) => this.storeDocument(d, 'SubgraphMeta', network)),
    ]);
  }

  async onRefresh() {
    await Promise.all(
      this.env.SUPPORTED_NETWORKS.flatMap((network) => {
        return [
          this.fetchAllDBViews(network),
          this.fetchAllGraphViews(network),
          this.analytics
            .refresh(network)
            .then(async () => {
              console.log('Wrote analytics data for ', network);
              this.putStorageKey(
                `${this.serviceName}/${network}/analytics`,
                this.analytics.serializeToJSON(network)
              );
              await this.logger.submitMetrics({
                series: [
                  {
                    metric: 'registry.data.analytics',
                    points: [
                      {
                        value: 1,
                        timestamp: getNowSeconds(),
                      },
                    ],
                    tags: [`network:${network}`],
                    type: MetricType.Gauge,
                  },
                ],
              });
            })
            .catch((e) => {
              console.log('error', e);
            }),
        ];
      })
    );
  }
}
