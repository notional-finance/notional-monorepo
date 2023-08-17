import {
  ExtractObservableReturn,
  Network,
  getNowSeconds,
} from '@notional-finance/util';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import { map, shareReplay, take } from 'rxjs';
import { Registry } from '../Registry';

interface DataPoint {
  [key: string]: number | string | null;
}
type AnalyticsData = DataPoint[];

const VIEWS = [
  'asset_price_volatility',
  'notional_asset_historical_prices',
  'notional_assets_tvls_and_apys',
  'nToken_trading_fees_apys',
] as const;

type AnalyticsViews = typeof VIEWS[number];

export class AnalyticsRegistryClient extends ClientRegistry<AnalyticsData> {
  protected cachePath() {
    return Routes.Analytics;
  }

  subscribeDataSet(network: Network, view: AnalyticsViews) {
    return this.subscribeSubject(network, view);
  }

  getDataSet(network: Network, view: AnalyticsViews) {
    return this.getLatestFromSubject(network, view);
  }

  subscribeAssetVolatility(network: Network) {
    return this.subscribeDataSet(network, 'asset_price_volatility')?.pipe(
      map((d) => {
        const tokens = Registry.getTokenRegistry();
        return (
          d?.map((p) => ({
            base: tokens.getTokenByID(network, p['base_token_id'] as string),
            quote: tokens.getTokenByID(network, p['quote_token_id'] as string),
            oneDay: (p['return_1d'] as number) * 100,
            sevenDay: (p['return_7d'] as number) * 100,
          })) || []
        );
      }),
      shareReplay(1)
    );
  }

  getAssetVolatility(network: Network) {
    const o = this.subscribeAssetVolatility(network);
    let data: ExtractObservableReturn<typeof o> | undefined;

    o?.pipe(take(1)).forEach((d) => (data = d));
    return data;
  }

  protected override async _refresh(network: Network) {
    const values = await Promise.all(
      VIEWS.map((v) =>
        this._fetch<AnalyticsData>(network, v).then(
          (d) => [v, d] as [string, AnalyticsData]
        )
      )
    );

    return {
      values,
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    };
  }
}
