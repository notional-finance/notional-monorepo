// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AnalyticsData, CacheSchema } from '../Definitions';
import crossFetch from 'cross-fetch';
import { getEnvVar } from '../utils/env';
import {
  fetchGraphPaginate,
  loadGraphClientDeferred,
  ServerRegistry,
} from './server-registry';
import {
  FIAT_ADDRESS,
  firstValue,
  floorToMidnight,
  getNowSeconds,
  groupArrayToMap,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  SECONDS_IN_DAY,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { ExecutionResult } from 'graphql';
import { TypedDocumentNode } from '@apollo/client/core';
import {
  ChartType,
  TimeSeriesLegend,
  TimeSeriesResponse,
} from '../models/ModelTypes';
import { Env } from '.';
import { formatUnits } from 'ethers/lib/utils';
import { TimeSeriesDataPoint } from '../models/ModelTypes';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { HistoricalOracleValuesQuery } from '../.graphclient';
import { PendlePTVaults } from '../config/whitelisted-vaults';
import { TokenBalance } from '../token-balance';

export type GraphDocument = keyof Omit<
  Awaited<ReturnType<typeof loadGraphClientDeferred>>,
  'execute'
>;

const USE_CROSS_FETCH =
  getEnvVar('NX_USE_CROSS_FETCH') || getEnvVar('NODE_ENV') == 'test';

export type ActiveAccounts = Record<string, number>;

export class AnalyticsServer extends ServerRegistry<unknown> {
  constructor(env: Env) {
    super(env);
  }

  public override hasAllNetwork() {
    return true;
  }

  protected formatToNumber(value: BigNumberish, decimals: number) {
    return parseFloat(formatUnits(value, decimals));
  }

  protected formatToPercent(value: BigNumberish, decimals: number) {
    return parseFloat(formatUnits(value, decimals)) * 100;
  }

  protected _priceChange(
    daysAgo: number,
    timeSeries: TimeSeriesResponse,
    asset: string,
    network: Network,
    isFiat: boolean
  ) {
    try {
      const pastPrice = timeSeries.data[timeSeries.data.length - (daysAgo + 1)];
      if (network === Network.all && asset === 'note') {
        return {
          pastDate: pastPrice.timestamp,
          pastFiat: TokenBalance.toJSON(
            utils.parseUnits(pastPrice.price.toString(), 18),
            'ETH',
            Network.all
          ),
        };
      } else if (isFiat) {
        return {
          pastDate: pastPrice.timestamp,
          pastFiat: TokenBalance.toJSON(
            utils.parseUnits(pastPrice.price.toFixed(6), 6),
            'USD',
            Network.all
          ),
        };
      } else {
        return {
          pastDate: pastPrice.timestamp,
          pastUnderlying: pastPrice.priceToUnderlying,
          pastFiat: TokenBalance.toJSON(
            utils.parseUnits(pastPrice.priceToUSD.toFixed(6), 6),
            'USD',
            Network.all
          ),
        };
      }
    } catch (e) {
      return undefined;
    }
  }

  protected calculatePriceChanges(
    timeSeries: TimeSeriesResponse[],
    network: Network
  ): Map<
    string,
    {
      oneDay: ReturnType<AnalyticsServer['_priceChange']>;
      threeDay: ReturnType<AnalyticsServer['_priceChange']>;
      sevenDay: ReturnType<AnalyticsServer['_priceChange']>;
    }
  > {
    return timeSeries
      .filter((t) => t.id.includes(ChartType.PRICE))
      .reduce(
        (acc, ts) => {
          const quote =
            ts.id.split(':').length === 3
              ? ts.id.split(':')[1]
              : ts.id.split(':')[0];
          const isFiat =
            ts.id.split(':')[0].toLowerCase() === FIAT_ADDRESS.toLowerCase() ||
            network === Network.all;
          acc.set(quote, {
            oneDay: this._priceChange(1, ts, quote, network, isFiat),
            threeDay: this._priceChange(3, ts, quote, network, isFiat),
            sevenDay: this._priceChange(7, ts, quote, network, isFiat),
          });

          return acc;
        },
        new Map<
          string,
          {
            oneDay: ReturnType<AnalyticsServer['_priceChange']>;
            threeDay: ReturnType<AnalyticsServer['_priceChange']>;
            sevenDay: ReturnType<AnalyticsServer['_priceChange']>;
          }
        >()
      );
  }

  public async fetchTimeSeries(network: Network, vaultAddresses: string[]) {
    const allNetworkPrices = await this.allNetworkPrices();
    if (network === Network.all) {
      return {
        timeSeries: allNetworkPrices,
        priceChanges: this.calculatePriceChanges(allNetworkPrices, network),
      };
    }

    const timeSeries = await this._fetchTokenTimeSeries(
      network,
      vaultAddresses
    );
    const priceChanges = this.calculatePriceChanges(timeSeries, network);

    return {
      timeSeries,
      priceChanges,
    };
  }

  protected reduceTimeSeriesToMidnight<T extends { timestamp: number }>(
    data: T[]
  ) {
    return data.reverse().reduce((acc, d) => {
      const flooredTimestamp = floorToMidnight(d.timestamp);
      // If floored timestamp is equal then skip it, we only return one value per day at midnight UTC
      if (
        acc.length > 0 &&
        acc[acc.length - 1].timestamp === flooredTimestamp
      ) {
        return acc;
      } else {
        acc.push({
          ...d,
          timestamp: flooredTimestamp,
        });
        return acc;
      }
    }, [] as T[]);
  }

  protected getPriceAtTime(
    priceHistory: TimeSeriesResponse | undefined,
    timestamp: number
  ) {
    const price = priceHistory?.data.find((p) => p.timestamp === timestamp);
    return price ? price['price'] : 0;
  }

  /** Ensures that chart always has default values throughout the specified range.  */
  protected fillChartDaily(
    data: TimeSeriesDataPoint[],
    defaultValues: Omit<TimeSeriesDataPoint, 'timestamp'>
  ) {
    if (data.length === 0) return data;

    const startTS = floorToMidnight(
      Math.min(...data.map(({ timestamp }) => timestamp))
    );
    const endTS = floorToMidnight(getNowSeconds());
    const buckets = (endTS - startTS) / SECONDS_IN_DAY + 1;

    // This algorithm ensures that the data is sorted.
    return new Array(buckets).fill(0).map((_, i) => {
      const ts = startTS + i * SECONDS_IN_DAY;
      return (
        data.find(({ timestamp }) => timestamp === ts) || {
          ...defaultValues,
          timestamp: ts,
        }
      );
    });
  }

  protected getUnderlyingPriceHistory(
    oracle: HistoricalOracleValuesQuery['oracles'][number]
  ) {
    const priceData = this.reduceTimeSeriesToMidnight(
      oracle.historicalRates || []
    ).map((r) => {
      return {
        timestamp: r.timestamp,
        price: this.formatToNumber(r.rate, oracle.decimals),
      };
    });

    return {
      data: this.fillChartDaily(priceData || [], {
        price: 0,
      }),
      legend: [
        {
          series: 'price',
          format: 'number',
          decimals: oracle?.decimals,
        },
      ] as TimeSeriesLegend[],
    };
  }

  protected getPriceAndTVLHistory(
    oracles: HistoricalOracleValuesQuery['oracles'],
    chainlinkOracles: TimeSeriesResponse[],
    network: Network
  ) {
    const priceOracle = oracles.find((o) => {
      if (o.quote.tokenType === 'VaultShare') {
        return o.oracleType === 'VaultShareOracleRate';
      }
      return false;
    });

    const ethPriceHistory = chainlinkOracles?.find(
      (o) =>
        o.id === `${ZERO_ADDRESS}:${priceOracle?.base.id}:${ChartType.PRICE}`
    );
    const usdETHPriceHistory = chainlinkOracles?.find(
      (o) =>
        o.id ===
        `${FIAT_ADDRESS.toLowerCase()}:${ZERO_ADDRESS}:${ChartType.PRICE}`
    );

    const priceData = priceOracle?.historicalRates
      ? this.reduceTimeSeriesToMidnight(priceOracle.historicalRates).map(
          (r) => {
            const tvlUnderlying = this.formatToNumber(
              BigNumber.from(r.totalSupply || 0)
                .mul(BigNumber.from(r.rate || 0))
                .div(BigNumber.from(priceOracle.ratePrecision)),
              INTERNAL_TOKEN_DECIMALS
            );

            const ethPrice =
              // Handle special case for ETH
              priceOracle?.base.id === ZERO_ADDRESS
                ? 1
                : this.getPriceAtTime(ethPriceHistory, r.timestamp);
            const usdPrice = this.getPriceAtTime(
              usdETHPriceHistory,
              r.timestamp
            );

            const price = BigNumber.from(r.rate);
            const oracleDecimals =
              // Override PT vault addresses b/c the decimals are not right in the subgraph
              PendlePTVaults[network].includes(priceOracle.oracleAddress)
                ? 18
                : priceOracle.decimals;

            const priceToUnderlying = this.formatToNumber(
              price,
              oracleDecimals
            );
            const priceToETH = priceToUnderlying * ethPrice;
            const priceToUSD = priceToETH * usdPrice;

            return {
              timestamp: r.timestamp,
              priceToUnderlying,
              priceToETH,
              priceToUSD,
              totalSupply: this.formatToNumber(
                r.totalSupply || 0,
                INTERNAL_TOKEN_DECIMALS
              ),
              tvlUnderlying,
              tvlETH: tvlUnderlying * priceToETH,
              tvlUSD: tvlUnderlying * priceToUSD,
            };
          }
        )
      : [];

    return {
      priceData: this.fillChartDaily(priceData || [], {
        priceToUnderlying: 0,
        priceToETH: 0,
        priceToUSD: 0,
        totalSupply: 0,
        tvlUnderlying: 0,
        tvlETH: 0,
        tvlUSD: 0,
      }),
      priceLegend: [
        {
          series: 'priceToUnderlying',
          format: 'number',
          decimals: priceOracle?.decimals,
        },
        {
          series: 'priceToETH',
          format: 'number',
          decimals: priceOracle?.decimals,
        },
        {
          series: 'priceToUSD',
          format: 'number',
          decimals: priceOracle?.decimals,
        },
        {
          series: 'tvlETH',
          format: 'number',
          decimals: INTERNAL_TOKEN_DECIMALS,
        },
        {
          series: 'tvlUnderlying',
          format: 'number',
          decimals: INTERNAL_TOKEN_DECIMALS,
        },
        {
          series: 'tvlUSD',
          format: 'number',
          decimals: INTERNAL_TOKEN_DECIMALS,
        },
        {
          series: 'totalSupply',
          format: 'number',
          decimals: INTERNAL_TOKEN_DECIMALS,
        },
      ] as TimeSeriesLegend[],
    };
  }

  protected async _fetchTokenTimeSeries(
    network: Network,
    vaultAddresses: string[],
    minTimestamp = getNowSeconds() - 90 * SECONDS_IN_DAY
  ) {
    const results: TimeSeriesResponse[] = [];

    const historicalOracleValues =
      await this.fetchGraphDocument<HistoricalOracleValuesQuery>(
        network,
        'HistoricalOracleValuesDocument',
        { minTimestamp: minTimestamp.toString() },
        'oracles'
      );

    const oraclesByQuote = groupArrayToMap(
      historicalOracleValues.data?.oracles.filter(
        (o) => o.oracleType !== 'Chainlink'
      ) || [],
      (o) => o.quote.id
    );

    const chainlinkOracles =
      historicalOracleValues.data?.oracles
        .filter((o) => o.oracleType === 'Chainlink')
        .map((o) => ({
          id: `${o.base.id}:${o.quote.id}:${ChartType.PRICE}`,
          ...this.getUnderlyingPriceHistory(o),
        })) || ([] as TimeSeriesResponse[]);

    oraclesByQuote.forEach((oracles, quote) => {
      const { priceData, priceLegend } = this.getPriceAndTVLHistory(
        oracles,
        chainlinkOracles,
        network
      );

      results.push({
        id: `${quote}:${ChartType.PRICE}`,
        data: priceData,
        legend: priceLegend,
      });
    });

    const vaults: TimeSeriesResponse[] = await Promise.all(
      vaultAddresses.map(async (vaultAddress) => {
        let r: AnalyticsData;
        try {
          r = await this.fetchView(network, vaultAddress);
        } catch {
          r = [];
        }
        const data = r.map((p) => {
          return {
            timestamp: p['Timestamp'] as number,
            totalAPY: this._convert(p['Total Strategy APY'], (d) => d * 100),
            ...Object.keys(p)
              .filter((k) => k !== 'Timestamp' && k !== 'Day')
              .reduce(
                (o, k) =>
                  Object.assign(o, {
                    [k]: this._convert(p[k], (d) => d * 100),
                  }),
                {} as Record<string, number>
              ),
          } as TimeSeriesDataPoint;
        });

        const legend = Object.keys(firstValue(data) || {}).map((k) => ({
          series: k,
          format: 'percent',
        }));

        return {
          id: `${vaultAddress}:${ChartType.APY}`,
          data,
          legend: [
            { series: 'totalAPY', format: 'percent' },
            ...legend,
          ] as TimeSeriesLegend[],
        };
      })
    );

    return results.concat(chainlinkOracles).concat(vaults);
  }

  protected async _refresh(network: Network) {
    return {
      values: [],
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    } as CacheSchema<unknown>;
  }

  protected async allNetworkPrices() {
    const flatData = await this.fetchView(
      Network.all,
      'historical_oracle_values'
    );

    return Array.from(
      flatData
        .reduce((acc, p) => {
          const id = `${p['base']}:${p['quote']}:${ChartType.PRICE}`;
          const resp = acc.get(id) || {
            id,
            data: [],
            legend: [
              {
                series: 'price',
                format: 'number',
                decimals: p['decimals'] as number,
              },
            ],
          };

          resp.data.push({
            timestamp: p['timestamp'] as number,
            price: this.formatToNumber(
              p['latest_rate'] as string,
              p['decimals'] as number
            ),
          });

          acc.set(id, resp);
          return acc;
        }, new Map<string, TimeSeriesResponse>())
        .values()
    );
  }

  async fetchView(network: Network, view: string): Promise<AnalyticsData> {
    const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
    const cacheUrl = `https://registry.notional.finance/${network}/views/${view}`;
    const result = await _fetch(cacheUrl);
    const body = await result.text();
    if (result.status !== 200) throw Error(`Failed Request: ${body}`);
    return JSON.parse(body);
  }

  async fetchGraphDocument<T = unknown>(
    network: Network,
    document: GraphDocument,
    variables: Record<string, string | number> = {},
    rootVariable?: string
  ): Promise<ExecutionResult<T>> {
    const documents = await loadGraphClientDeferred();
    const doc = documents[document] as TypedDocumentNode;
    return await fetchGraphPaginate(
      network,
      doc,
      rootVariable,
      this.env.NX_SUBGRAPH_API_KEY,
      {
        ...variables,
        chainName: network,
      }
    );
  }

  private _convert<T>(v: string | number | null, fn: (d: number) => T) {
    if (v === null) return 0;
    else if (typeof v === 'string') return fn(parseFloat(v));
    else return fn(v);
  }
}
