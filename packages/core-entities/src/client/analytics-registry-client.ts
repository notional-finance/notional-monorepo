import {
  ExtractObservableReturn,
  Network,
  getNowSeconds,
} from '@notional-finance/util';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import { map, shareReplay, take, Observable } from 'rxjs';
import { Registry } from '../Registry';
import { TokenBalance } from '../token-balance';
import { BigNumber } from 'ethers';
import { OracleDefinition } from '../Definitions';

interface DataPoint {
  [key: string]: number | string | null;
}
type AnalyticsData = DataPoint[];

const VIEWS = [
  'asset_price_volatility',
  'historical_oracle_values',
  'notional_asset_historical_prices',
  'notional_assets_apys_and_tvls',
  'nToken_trading_fees_apys',
] as const;

type AnalyticsViews = typeof VIEWS[number];

export class AnalyticsRegistryClient extends ClientRegistry<AnalyticsData> {
  protected cachePath() {
    return Routes.Analytics;
  }

  get USD() {
    return Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'USD');
  }

  get ETH() {
    return Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'ETH');
  }

  subscribeDataSet(network: Network, view: AnalyticsViews) {
    return this.subscribeSubject(network, view);
  }

  private _getLatest<T>(o: Observable<T> | undefined) {
    let data: ExtractObservableReturn<typeof o> | undefined;

    o?.pipe(take(1)).forEach((d) => (data = d));
    return data;
  }

  private _convertOrNull<T>(v: string | number | null, fn: (d: number) => T) {
    if (v === null) return null;
    else if (typeof v === 'string') return fn(parseFloat(v));
    else return fn(v);
  }

  subscribeAssetVolatility(network: Network) {
    return this.subscribeDataSet(network, 'asset_price_volatility')?.pipe(
      map((d) => {
        const tokens = Registry.getTokenRegistry();
        return (
          d?.map((p) => ({
            base: tokens.getTokenByID(network, p['base_token_id'] as string),
            quote: tokens.getTokenByID(network, p['quote_token_id'] as string),
            oneDay: this._convertOrNull(p['return_1d'], (d) => d * 100),
            sevenDay: this._convertOrNull(p['return_7d'], (d) => d * 100),
          })) || []
        );
      }),
      shareReplay(1)
    );
  }

  subscribeHistoricalPrices(network: Network) {
    return this.subscribeDataSet(
      network,
      'notional_asset_historical_prices'
    )?.pipe(
      map((d) => {
        const tokens = Registry.getTokenRegistry();
        return (
          d?.map((p) => {
            const token = tokens.getTokenByID(network, p['token_id'] as string);
            const underlying = tokens.getTokenByID(
              network,
              p['underlying_token_id'] as string
            );

            return {
              token,
              timestamp: p['timestamp'] as number,
              assetToUnderlying: this._convertOrNull(
                p['asset_to_underlying_exchange_rate'],
                (d) => TokenBalance.fromFloat(d.toFixed(6), underlying)
              ),
              underlyingToETH: this._convertOrNull(
                p['underlying_to_eth_exchange_rate'],
                (d) => TokenBalance.fromFloat(d.toFixed(6), this.ETH)
              ),
              assetToUSD: this._convertOrNull(
                p['asset_to_usd_exchange_rate'],
                (d) => TokenBalance.fromFloat(d.toFixed(6), this.USD)
              ),
              underlyingToUSD: this._convertOrNull(
                p['underlying_to_usd_exchange_rate'],
                (d) => TokenBalance.fromFloat(d.toFixed(6), this.USD)
              ),
            };
          }) || []
        );
      }),
      shareReplay(1)
    );
  }

  subscribeNTokenTradingFees(network: Network) {
    return this.subscribeDataSet(network, 'nToken_trading_fees_apys')?.pipe(
      map((d) => {
        const tokens = Registry.getTokenRegistry();
        return (
          d?.map((p) => {
            const token = tokens.getTokenByID(network, p['token_id'] as string);
            return {
              token,
              timestamp: p['timestamp'] as number,
              apy: this._convertOrNull(
                p['ntoken_trading_fees_apy'],
                (d) => d * 100
              ),
            };
          }) || []
        );
      }),
      shareReplay(1)
    );
  }

  subscribeAssetHistory(network: Network) {
    return this.subscribeDataSet(
      network,
      'notional_assets_apys_and_tvls'
    )?.pipe(
      map((d) => {
        const tokens = Registry.getTokenRegistry();
        return (
          d?.map((p) => {
            const token = tokens.getTokenByID(network, p['token_id'] as string);
            const underlying = tokens.getTokenByID(
              network,
              p['underlying_token_id'] as string
            );

            return {
              token,
              timestamp: p['timestamp'] as number,
              totalAPY: this._convertOrNull(p['total_apy'], (d) => d),
              tvlUnderlying: this._convertOrNull(p['tvl_underlying'], (d) =>
                TokenBalance.fromFloat(d.toFixed(6), underlying)
              ),
              tvlUSD: this._convertOrNull(p['tvl_usd'], (d) =>
                TokenBalance.fromFloat(d.toFixed(6), this.USD)
              ),
              assetToUnderlyingExchangeRate: this._convertOrNull(
                p['asset_to_underlying_exchange_rate'],
                (d) => TokenBalance.fromFloat(d.toFixed(6), underlying)
              ),
              assetToUSDExchangeRate: this._convertOrNull(
                p['asset_to_usd_exchange_rate'],
                (d) => TokenBalance.fromFloat(d.toFixed(6), this.USD)
              ),
            };
          }) || []
        );
      }),
      shareReplay(1)
    );
  }

  subscribeVault(network: Network, vaultAddress: string) {
    return this.subscribeSubject(network, vaultAddress.toLowerCase())?.pipe(
      map((d) => {
        return (
          d?.map((p) => {
            return {
              vaultAddress,
              timestamp: p['timestamp'] as number,
              totalAPY: this._convertOrNull(
                p['total_strategy_apy'],
                (d) => d * 100
              ),
              totalAPY7D: this._convertOrNull(
                p['total_strategy_apy_7d_average'],
                (d) => d * 100
              ),
              variableBorrowRate: this._convertOrNull(
                p['pcashdebt_borrow_rate'],
                (d) => d * 100
              ),
              returnDrivers: Object.keys(p)
                .filter(
                  (k) =>
                    k !== 'timestamp' &&
                    k !== 'total_strategy_apy_7d_average' &&
                    k !== 'pcashdebt_borrow_rate' &&
                    k !== 'day'
                )
                .reduce(
                  (o, k) =>
                    Object.assign(o, {
                      [k]: this._convertOrNull(p[k], (d) => d * 100),
                    }),
                  {} as Record<string, number | null>
                ),
            };
          }) || []
        );
      }),
      shareReplay(1)
    );
  }

  subscribeHistoricalOracles(network: Network, timestamp: number) {
    return this.subscribeDataSet(network, 'historical_oracle_values')?.pipe(
      map((d) => {
        return (
          d
            ?.filter((p) => p['timestamp'] === timestamp)
            .map((p) => {
              return {
                id: `${p['base']}:${p['quote']}:${p['oracle_type']}`,
                oracleAddress: p['oracle_address'],
                network,
                oracleType: p['oracle_type'],
                base: p['base'],
                quote: p['quote'],
                decimals: p['decimals'],
                latestRate: {
                  rate: BigNumber.from(p['latest_rate']),
                  timestamp,
                  blockNumber: 0,
                },
              } as OracleDefinition;
            }) || []
        );
      }),
      shareReplay(1)
    );
  }

  getAssetVolatility(network: Network) {
    return this._getLatest(this.subscribeAssetVolatility(network));
  }

  getHistoricalOracles(network: Network, timestamp: number) {
    return this._getLatest(this.subscribeHistoricalOracles(network, timestamp));
  }

  getHistoricalPrices(network: Network) {
    return this._getLatest(this.subscribeHistoricalPrices(network));
  }

  getNTokenTradingFees(network: Network) {
    return this._getLatest(this.subscribeNTokenTradingFees(network));
  }

  getAssetHistory(network: Network) {
    return this._getLatest(this.subscribeAssetHistory(network));
  }

  getVault(network: Network, vaultAddress: string) {
    return this._getLatest(this.subscribeVault(network, vaultAddress));
  }

  protected override async _refresh(network: Network) {
    const vaultViews =
      Registry.getConfigurationRegistry()
        .getAllListedVaults(network)
        ?.map((c) => c.vaultAddress.toLowerCase()) || [];

    const values = await Promise.all(
      [...VIEWS, ...vaultViews].map((v) =>
        this._fetch<AnalyticsData>(network, v).then(
          (d) =>
            (Array.isArray(d) ? [v, d] : [v, null]) as [
              string,
              AnalyticsData | null
            ]
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
