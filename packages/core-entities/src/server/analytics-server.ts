// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AnalyticsData, CacheSchema } from '../Definitions';
import crossFetch from 'cross-fetch';
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
  groupArrayByKey,
  groupArrayToMap,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  RATE_DECIMALS,
  SECONDS_IN_DAY,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, BigNumberish } from 'ethers';
import { ExecutionResult } from 'graphql';
import { TypedDocumentNode } from '@apollo/client/core';
import {
  ChartType,
  TimeSeriesLegend,
  TimeSeriesResponse,
} from '../models/ModelTypes';
import { Env } from '.';
import { formatUnits } from 'ethers/lib/utils';
import { OracleRegistryClient } from '../client';
import { OracleType, TimeSeriesDataPoint } from '../models/ModelTypes';
import { getSecondaryTokenIncentive } from '../config/whitelisted-tokens';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { HistoricalOracleValuesQuery } from '../.graphclient';

export type GraphDocument = keyof Omit<
  Awaited<ReturnType<typeof loadGraphClientDeferred>>,
  'execute'
>;

const USE_CROSS_FETCH =
  process.env['NX_USE_CROSS_FETCH'] || process.env['NODE_ENV'] == 'test';

export type ActiveAccounts = Record<string, number>;

export const ASSET_PRICE_ORACLES = [
  'nTokenToUnderlyingExchangeRate',
  'PrimeCashToUnderlyingExchangeRate',
  'PrimeDebtToUnderlyingExchangeRate',
  'VaultShareOracleRate',
];

function getOracleName(oracleType: OracleType, incentiveSymbol?: string) {
  switch (oracleType) {
    case 'fCashOracleRate':
      return 'Fixed Rate';
    case 'PrimeCashPremiumInterestRate':
      return 'Variable Lend Rate';
    case 'PrimeDebtPremiumInterestRate':
      return 'Variable Borrow Rate';
    case 'nTokenBlendedInterestRate':
      return 'Interest Yield';
    case 'nTokenFeeRate':
      return 'Trading Fees';
    case 'nTokenIncentiveRate':
      return 'NOTE Incentive APY';
    case 'nTokenSecondaryIncentiveRate':
      return `${incentiveSymbol || 'Secondary'} Incentive APY`;
    case 'sNOTEReinvestmentAPY':
      return 'sNOTE APY';
    default:
      return oracleType;
  }
}

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

  public async fetchTimeSeries(network: Network) {
    const allNetworkPrices = await this.allNetworkPrices();
    if (network === Network.all) {
      return allNetworkPrices;
    }
    const notePrices = allNetworkPrices.find(
      (p) => p.id === `eth:note:${ChartType.PRICE}`
    );

    return this._fetchTokenTimeSeries(network, notePrices);
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
    chainlinkOracles: TimeSeriesResponse[]
  ) {
    const priceOracle = oracles.find((o) => {
      if (o.quote.tokenType === 'fCash') {
        return o.oracleType === 'fCashOracleRate';
      } else if (o.quote.tokenType === 'nToken') {
        return o.oracleType === 'nTokenToUnderlyingExchangeRate';
      } else if (o.quote.tokenType === 'PrimeCash') {
        return o.oracleType === 'PrimeCashToUnderlyingExchangeRate';
      } else if (o.quote.tokenType === 'PrimeDebt') {
        return o.oracleType === 'PrimeDebtToUnderlyingExchangeRate';
      } else if (o.quote.tokenType === 'VaultShare') {
        return o.oracleType === 'VaultShareOracleRate';
      }
      return false;
    });

    const ethPriceHistory = chainlinkOracles?.find(
      (o) =>
        o.id === `${ZERO_ADDRESS}:${priceOracle?.base.id}:${ChartType.PRICE}`
    );
    const usdETHPriceHistory = chainlinkOracles?.find(
      (o) => o.id === `${FIAT_ADDRESS}:${ZERO_ADDRESS}:${ChartType.PRICE}`
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

            // If fCash need to convert to the exchange rate
            const price =
              priceOracle.oracleType === 'fCashOracleRate' &&
              priceOracle.quote.maturity
                ? OracleRegistryClient.interestToExchangeRate(
                    BigNumber.from(r.rate),
                    priceOracle.quote.maturity,
                    r.timestamp
                  )
                : BigNumber.from(r.rate);
            const priceToUnderlying = this.formatToNumber(
              price,
              priceOracle.decimals
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

  protected getAPYData(
    oracles: HistoricalOracleValuesQuery['oracles'],
    network: Network,
    chainlinkOracles: TimeSeriesResponse[],
    notePrices: TimeSeriesResponse | undefined
  ) {
    const apyOracles = oracles.filter((o) => {
      if (o.quote.tokenType === 'fCash') {
        return o.oracleType === 'fCashOracleRate';
      } else if (o.quote.tokenType === 'PrimeCash') {
        return o.oracleType === 'PrimeCashPremiumInterestRate';
      } else if (o.quote.tokenType === 'PrimeDebt') {
        return o.oracleType === 'PrimeDebtPremiumInterestRate';
      } else if (o.quote.tokenType === 'VaultShare') {
        return o.oracleType === 'VaultShareOracleRate';
      } else if (o.quote.tokenType === 'nToken') {
        return [
          'nTokenBlendedInterestRate',
          'nTokenFeeRate',
          'nTokenIncentiveRate',
          'nTokenSecondaryIncentiveRate',
        ].includes(o.oracleType);
      }
      return false;
    });

    let apyData: TimeSeriesDataPoint[] = [];
    let apyLegend: TimeSeriesLegend[] = [];

    if (apyOracles.length === 1) {
      apyLegend = [
        {
          series: 'totalAPY',
          format: 'percent',
        },
      ];

      // Non-nToken APYs are all based on the same oracle so we can just use the first one
      const isVaultShare = apyOracles[0].oracleType === 'VaultShareOracleRate';

      apyData = this.reduceTimeSeriesToMidnight(
        apyOracles[0].historicalRates?.map((r) => {
          return {
            timestamp: r.timestamp,
            totalAPY:
              apyOracles[0].oracleType === 'PrimeDebtPremiumInterestRate' ||
              apyOracles[0].oracleType === 'PrimeCashPremiumInterestRate'
                ? this.formatToPercent(r.rate, RATE_DECIMALS) // This decimals are not marked correctly in the subgraph
                : this.formatToPercent(r.rate, apyOracles[0].decimals),
          };
        }) || []
      );

      if (isVaultShare) {
        // Take the moving 10 day average of the price difference.
        apyData = apyData
          .map((d, i, arr) => {
            if (i < 10)
              return {
                timestamp: d.timestamp,
                totalAPY: undefined,
              };

            const initialPrice = arr[i - 10]['totalAPY'];
            const priceDifference =
              d['totalAPY'] && initialPrice
                ? d['totalAPY'] - initialPrice
                : undefined;
            const annualizedAPY = priceDifference
              ? 100 * ((1 + priceDifference / initialPrice) ** (365 / 10) - 1)
              : undefined;

            return {
              timestamp: d.timestamp,
              totalAPY: annualizedAPY,
            };
          })
          .filter((d) => d?.totalAPY !== undefined) as TimeSeriesDataPoint[];
      }
    } else {
      const base = apyOracles[0].base.id;
      const ethPriceHistory = chainlinkOracles.find(
        (c) => c.id === `${ZERO_ADDRESS}:${base}:${ChartType.PRICE}`
      );

      // In the other case, we are dealing with nTokens which have multiple oracles
      const flooredSeries = apyOracles.flatMap((o) => {
        let incentiveSymbol: string | undefined;
        let incentivePriceHistory: TimeSeriesResponse | undefined;
        if (o.oracleType === 'nTokenSecondaryIncentiveRate') {
          let secondaryToken: string | undefined;
          ({ symbol: incentiveSymbol, token: secondaryToken } =
            getSecondaryTokenIncentive(network, o.base.id));
          incentivePriceHistory = chainlinkOracles.find(
            (c) =>
              c.id === `${ZERO_ADDRESS}:${secondaryToken}:${ChartType.PRICE}`
          );
        }
        const keyName = getOracleName(o.oracleType, incentiveSymbol);

        return this.reduceTimeSeriesToMidnight(o.historicalRates || []).map(
          (r) => {
            let apy = this.formatToPercent(r.rate, o.decimals);
            const ethBasePrice =
              base === ZERO_ADDRESS
                ? 1
                : this.getPriceAtTime(ethPriceHistory, r.timestamp);
            const incentiveETHPrice = this.getPriceAtTime(
              incentivePriceHistory,
              r.timestamp
            );
            const noteETHPrice = this.getPriceAtTime(notePrices, r.timestamp);

            if (o.oracleType === 'nTokenIncentiveRate') {
              apy =
                (this.formatToPercent(r.rate, o.decimals) * noteETHPrice) /
                ethBasePrice;
            } else if (incentiveSymbol && incentiveETHPrice) {
              // NOTE: even though o.decimals is marked as 9, this is actually in 17 decimal precision,
              // because it is in 9 decimals of rate and 8 decimals of internal token precision.
              apy =
                (this.formatToPercent(r.rate, 17) * incentiveETHPrice) /
                ethBasePrice;
            }

            return {
              timestamp: r.timestamp,
              [keyName]: apy,
            };
          }
        );
      });

      // Flatten all the APYs into a single array
      apyData = groupArrayByKey(flooredSeries, (d) => d.timestamp)
        .map((d) => {
          return d.reduce((acc, v) => {
            return {
              ...acc,
              ...v,
            };
          }, {} as TimeSeriesDataPoint);
        })
        .map((d) => ({
          ...d,
          // Add the total APY by summing all the other APYs
          totalAPY: Object.keys(d)
            .filter((k) => k !== 'timestamp')
            .reduce((acc, k) => acc + d[k], 0),
        }));

      apyLegend = Object.keys(firstValue(apyData) || {})
        .filter((k) => k !== 'timestamp')
        .map((k) => ({
          series: k,
          format: 'percent',
        }));
    }

    return {
      apyData: this.fillChartDaily(apyData, { totalAPY: 0 }),
      apyLegend,
    };
  }

  protected async _fetchTokenTimeSeries(
    network: Network,
    notePrices: TimeSeriesResponse | undefined,
    minTimestamp = getNowSeconds() - 90 * SECONDS_IN_DAY
  ) {
    const results: TimeSeriesResponse[] = [];

    const historicalOracleValues =
      await this.fetchGraphDocument<HistoricalOracleValuesQuery>(
        network,
        'HistoricalOracleValuesDocument',
        { minTimestamp },
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
        chainlinkOracles
      );
      const { apyData, apyLegend } = this.getAPYData(
        oracles,
        network,
        chainlinkOracles,
        notePrices
      );

      results.push({
        id: `${quote}:${ChartType.PRICE}`,
        data: priceData,
        legend: priceLegend,
      });

      results.push({
        id: `${quote}:${ChartType.APY}`,
        data: apyData,
        legend: apyLegend,
      });
    });

    return results.concat(chainlinkOracles);
  }

  protected async _refresh(network: Network) {
    // const { finalResults: historicalTrading } = await fetchGraph(
    //   network,
    //   HistoricalTradingActivityDocument,
    //   (r) => {
    //     // Key = currencyId
    //     return Object.fromEntries(
    //       groupArrayToMap(
    //         r.tradingActivity.map((t) => {
    //           // Simplify the trading activity information into a single line item
    //           const fCashValue: string = t.transfers[2].value;
    //           const fCashId: string = t.transfers[2].token.id;
    //           const pCash: string = t.transfers[0].value;
    //           const pCashInUnderlying: string =
    //             t.transfers[0].valueInUnderlying;

    //           return {
    //             bundleName: t.bundleName,
    //             currencyId: t.transfers[0].token.currencyId as number,
    //             fCashId,
    //             fCashValue,
    //             pCash,
    //             pCashInUnderlying,
    //             timestamp: t.timestamp,
    //             blockNumber: t.blockNumber as number,
    //             transactionHash: t.transactionHash.id,
    //           };
    //         }),
    //         (t) => t.currencyId
    //       )
    //     );
    //   },
    //   this.env.NX_SUBGRAPH_API_KEY,
    //   { minTimestamp: getNowSeconds() - 30 * SECONDS_IN_DAY },
    //   'tradingActivity'
    // );

    // const { finalResults: vaultReinvestment } = await fetchGraph(
    //   network,
    //   VaultReinvestmentDocument,
    //   // Key = vault id
    //   (r) =>
    //     Object.fromEntries(
    //       groupArrayToMap(
    //         r.reinvestments.map((i) => ({ ...i, vault: i.vault.id })),
    //         (t) => t.vault
    //       )
    //     ),
    //   this.env.NX_SUBGRAPH_API_KEY,
    //   { minTimestamp },
    //   'reinvestments'
    // );

    // const { finalResults: activeAccounts } = await fetchGraph(
    //   network,
    //   ActiveAccountsDocument,
    //   (r) => {
    //     const activeAccounts = r.accounts
    //       .flatMap(
    //         (a) =>
    //           a.balances
    //             ?.filter((b) => b.current.currentBalance !== '0')
    //             .map(
    //               (b) =>
    //                 `${
    //                   b.token.tokenType === 'fCash' && b.token.isfCashDebt
    //                     ? 'fCashDebt'
    //                     : b.token.tokenType
    //                 }:${b.token.currencyId}`
    //             ) || []
    //       )
    //       .reduce((acc, v) => {
    //         if (acc[v]) acc[v] += 1;
    //         else acc[v] = 1;
    //         return acc;
    //       }, {} as Record<string, number>);
    //     const totalActive = r.accounts.filter(
    //       (a) =>
    //         (a.balances?.filter((b) => b.current.currentBalance !== '0') || [])
    //           .length > 0
    //     ).length;

    //     return Object.assign(activeAccounts, { totalActive });
    //   },
    //   this.env.NX_SUBGRAPH_API_KEY,
    //   {},
    //   'accounts'
    // );

    // const vaults = await Promise.all(
    //   whitelistedVaults(network).map(async (vaultAddress) => {
    //     let r: AnalyticsData;
    //     try {
    //       r = await this.fetchView(network, vaultAddress);
    //     } catch {
    //       r = [];
    //     }
    //     const data = r.map((p) => {
    //       return {
    //         vaultAddress,
    //         timestamp: p['Timestamp'] as number,
    //         totalAPY: this._convertOrNull(
    //           p['Total Strategy APY'],
    //           (d) => d * 100
    //         ),
    //         returnDrivers: Object.keys(p)
    //           .filter((k) => k !== 'Timestamp' && k !== 'Day')
    //           .reduce(
    //             (o, k) =>
    //               Object.assign(o, {
    //                 [k]: this._convertOrNull(p[k], (d) => d * 100),
    //               }),
    //             {} as Record<string, number | null>
    //           ),
    //       } as VaultData[number];
    //     });

    //     return [vaultAddress.toLowerCase(), data] as [string, VaultData];
    //   })
    // );

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
}
