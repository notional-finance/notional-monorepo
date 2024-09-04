// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AnalyticsData, CacheSchema } from '../Definitions';
import crossFetch from 'cross-fetch';
import {
  fetchGraphPaginate,
  loadGraphClientDeferred,
  ServerRegistry,
} from './server-registry';
import {
  firstValue,
  floorToMidnight,
  getNowSeconds,
  groupArrayByKey,
  groupArrayToMap,
  INTERNAL_TOKEN_DECIMALS,
  INTERNAL_TOKEN_PRECISION,
  Network,
  SECONDS_IN_DAY,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, BigNumberish } from 'ethers';
import { ExecutionResult } from 'graphql';
import { TypedDocumentNode } from '@apollo/client/core';
import { TimeSeriesLegend, TimeSeriesResponse } from '../models/AnalyticsModel';
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
    if (network === Network.all) {
      return this.allNetworkPrices();
    }

    return this._fetchTokenTimeSeries(network);
  }

  protected reduceTimeSeriesToMidnight(data: TimeSeriesDataPoint[]) {
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
    }, [] as TimeSeriesDataPoint[]);
  }

  protected getPriceAndTVLOracles(
    oracles: HistoricalOracleValuesQuery['oracles']
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

    const ethPriceOracle = oracles.find(
      (o) => o.oracleType === 'Chainlink' && o.base.id === ZERO_ADDRESS
    );

    const priceData = priceOracle?.historicalRates?.map((r) => {
      const tvlUnderlying = BigNumber.from(r.totalSupply || 0)
        .mul(BigNumber.from(r.rate || 0))
        .div(BigNumber.from(priceOracle.ratePrecision));
      const tvlETH = ethPriceOracle
        ? tvlUnderlying
            .mul(ethPriceOracle.latestRate?.rate || 0)
            .div(ethPriceOracle.ratePrecision)
        : BigNumber.from(0);

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

      return {
        timestamp: r.timestamp,
        price: this.formatToNumber(price, priceOracle.decimals),
        totalSupply: this.formatToNumber(
          r.totalSupply || 0,
          INTERNAL_TOKEN_DECIMALS
        ),
        tvlUnderlying: this.formatToNumber(
          tvlUnderlying,
          INTERNAL_TOKEN_DECIMALS
        ),
        tvlETH: this.formatToNumber(tvlETH, INTERNAL_TOKEN_DECIMALS),
      };
    });

    return {
      priceData: this.reduceTimeSeriesToMidnight(priceData || []),
      priceLegend: [
        {
          series: 'price',
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
          series: 'totalSupply',
          format: 'number',
          decimals: INTERNAL_TOKEN_DECIMALS,
        },
      ] as TimeSeriesLegend[],
    };
  }

  protected getAPYData(
    oracles: HistoricalOracleValuesQuery['oracles'],
    network: Network
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
            totalAPY: isVaultShare
              ? this.formatToPercent(r.rate, apyOracles[0].decimals)
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
      // TODO: get this price
      const noteETHPrice: BigNumber = BigNumber.from(10).pow(18);
      // TODO: get this price
      const ethBasePrice: BigNumber = BigNumber.from(10).pow(18);

      // In the other case, we are dealing with nTokens which have multiple oracles
      const flooredSeries = apyOracles.flatMap((o) => {
        const incentiveSymbol =
          o.oracleType === 'nTokenSecondaryIncentiveRate'
            ? getSecondaryTokenIncentive(network, o.base.id)
            : undefined;
        // TODO: get this price
        const incentiveETHPrice = incentiveSymbol
          ? BigNumber.from(10).pow(18)
          : undefined;

        const keyName = getOracleName(o.oracleType, incentiveSymbol);

        return this.reduceTimeSeriesToMidnight(
          o.historicalRates?.map((r) => {
            let apy = this.formatToPercent(r.rate, o.decimals);
            if (o.oracleType === 'nTokenIncentiveRate') {
              const noteAPY = BigNumber.from(r.rate)
                .mul(noteETHPrice)
                .div(ethBasePrice);
              apy = this.formatToPercent(noteAPY, INTERNAL_TOKEN_DECIMALS);
            } else if (incentiveSymbol && incentiveETHPrice) {
              const incentiveAPY = BigNumber.from(r.rate)
                .mul(incentiveETHPrice)
                .div(ethBasePrice)
                .div(INTERNAL_TOKEN_PRECISION);
              apy = this.formatToPercent(incentiveAPY, INTERNAL_TOKEN_DECIMALS);
            }

            return {
              timestamp: r.timestamp,
              [keyName]: apy,
            };
          }) || []
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
      apyData,
      apyLegend,
    };
  }

  protected async _fetchTokenTimeSeries(
    network: Network,
    minTimestamp = getNowSeconds() - 90 * SECONDS_IN_DAY
  ) {
    const results = [] as TimeSeriesResponse[];

    const historicalOracleValues =
      await this.fetchGraphDocument<HistoricalOracleValuesQuery>(
        network,
        'HistoricalOracleValuesDocument',
        { minTimestamp },
        'oracles'
      );

    const oraclesByQuote = groupArrayToMap(
      historicalOracleValues.data?.oracles || [],
      (o) => o.quote.id
    );

    oraclesByQuote.forEach((oracles, quote) => {
      const { priceData, priceLegend } = this.getPriceAndTVLOracles(oracles);
      const { apyData, apyLegend } = this.getAPYData(oracles, network);

      results.push({
        id: `${quote}:price`,
        data: priceData,
        legend: priceLegend,
      });

      results.push({
        id: `${quote}:apy`,
        data: apyData,
        legend: apyLegend,
      });
    });

    return results;
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
          const id = `${p['base']}:${p['quote']}`;
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

  private _convertOrNull<T>(v: string | number | null, fn: (d: number) => T) {
    if (v === null) return null;
    else if (typeof v === 'string') return fn(parseFloat(v));
    else return fn(v);
  }
}
