// eslint-disable-next-line @nx/enforce-module-boundaries
import { OracleType } from '../.graphclient';
import {
  AnalyticsData,
  CacheSchema,
  HistoricalOracles,
  HistoricalTrading,
  VaultReinvestment,
  HistoricalRate,
  VaultData,
} from '../Definitions';
import crossFetch from 'cross-fetch';
import {
  fetchGraph,
  fetchGraphPaginate,
  loadGraphClientDeferred,
  ServerRegistry,
} from './server-registry';
import {
  convertArrayToObject,
  floorToMidnight,
  getNowSeconds,
  groupArrayToMap,
  Network,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { whitelistedVaults } from '../config/whitelisted-vaults';
import { BigNumber } from 'ethers';
import { ExecutionResult } from 'graphql';
import { TypedDocumentNode } from '@apollo/client/core';
import { Env } from '.';

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

export class AnalyticsServer extends ServerRegistry<unknown> {
  constructor(
    private dataServiceURL: string,
    private dataServiceAuthToken: string,
    env: Env
  ) {
    super(env);
  }

  public override hasAllNetwork() {
    return true;
  }

  protected async _refresh(network: Network) {
    if (network === Network.all) {
      return this._refreshAllNetwork();
    }

    const {
      HistoricalOracleValuesDocument,
      HistoricalTradingActivityDocument,
      VaultReinvestmentDocument,
      ActiveAccountsDocument,
    } = await loadGraphClientDeferred();
    const minTimestamp = getNowSeconds() - 90 * SECONDS_IN_DAY;

    const { finalResults: historicalOracles, blockNumber } = await fetchGraph(
      network,
      HistoricalOracleValuesDocument,
      // Key = oracleId
      (r) =>
        convertArrayToObject(
          r.oracles.map((o) => {
            return {
              id: o.id,
              oracleAddress: o.oracleAddress,
              network,
              oracleType: o.oracleType,
              base: o.base.id,
              quote: o.quote.id,
              latestRate: o.latestRate,
              decimals: o.decimals,
              historicalRates:
                // This is sorted descending in the query so we always take the first value closest to
                // midnight after reversing the array
                o.historicalRates?.reverse()?.reduce((acc, r) => {
                  // TVL underlying is calculated on the current price
                  let tvlUnderlying: string | null = null;
                  if (
                    ASSET_PRICE_ORACLES.includes(o.oracleType) &&
                    r.totalSupply
                  ) {
                    tvlUnderlying = BigNumber.from(r.totalSupply)
                      .mul(BigNumber.from(r.rate))
                      .div(BigNumber.from(o.ratePrecision))
                      .toString();
                  }

                  const timestamp = floorToMidnight(r.timestamp);
                  // If floored timestamp is equal then skip it, we only return one value
                  // per day at midnight UTC
                  if (
                    acc.length > 0 &&
                    acc[acc.length - 1].timestamp === timestamp
                  ) {
                    return acc;
                  } else {
                    acc.push({
                      blockNumber: parseInt(r.blockNumber),
                      rate: r.rate,
                      timestamp,
                      totalSupply: r.totalSupply,
                      tvlUnderlying,
                    });
                    return acc;
                  }
                }, [] as HistoricalRate[]) || [],
            };
          }),
          'id'
        ),
      this.env.NX_SUBGRAPH_API_KEY,
      { minTimestamp },
      'oracles'
    );

    const { finalResults: historicalTrading } = await fetchGraph(
      network,
      HistoricalTradingActivityDocument,
      (r) => {
        // Key = currencyId
        return Object.fromEntries(
          groupArrayToMap(
            r.tradingActivity.map((t) => {
              // Simplify the trading activity information into a single line item
              const fCashValue: string = t.transfers[2].value;
              const fCashId: string = t.transfers[2].token.id;
              const pCash: string = t.transfers[0].value;
              const pCashInUnderlying: string =
                t.transfers[0].valueInUnderlying;

              return {
                bundleName: t.bundleName,
                currencyId: t.transfers[0].token.currencyId as number,
                fCashId,
                fCashValue,
                pCash,
                pCashInUnderlying,
                timestamp: t.timestamp,
                blockNumber: t.blockNumber as number,
                transactionHash: t.transactionHash.id,
              };
            }),
            (t) => t.currencyId
          )
        );
      },
      this.env.NX_SUBGRAPH_API_KEY,
      { minTimestamp: getNowSeconds() - 30 * SECONDS_IN_DAY },
      'tradingActivity'
    );

    const { finalResults: vaultReinvestment } = await fetchGraph(
      network,
      VaultReinvestmentDocument,
      // Key = vault id
      (r) =>
        Object.fromEntries(
          groupArrayToMap(
            r.reinvestments.map((i) => ({ ...i, vault: i.vault.id })),
            (t) => t.vault
          )
        ),
      this.env.NX_SUBGRAPH_API_KEY,
      { minTimestamp },
      'reinvestments'
    );

    const { finalResults: activeAccounts } = await fetchGraph(
      network,
      ActiveAccountsDocument,
      (r) => {
        const activeAccounts = r.accounts
          .flatMap(
            (a) =>
              a.balances
                ?.filter((b) => b.current.currentBalance !== '0')
                .map(
                  (b) =>
                    `${
                      b.token.tokenType === 'fCash' && b.token.isfCashDebt
                        ? 'fCashDebt'
                        : b.token.tokenType
                    }:${b.token.currencyId}`
                ) || []
          )
          .reduce((acc, v) => {
            if (acc[v]) acc[v] += 1;
            else acc[v] = 1;
            return acc;
          }, {} as Record<string, number>);
        const totalActive = r.accounts.filter(
          (a) =>
            (a.balances?.filter((b) => b.current.currentBalance !== '0') || [])
              .length > 0
        ).length;

        return Object.assign(activeAccounts, { totalActive });
      },
      this.env.NX_SUBGRAPH_API_KEY,
      {},
      'accounts'
    );

    const vaults = await Promise.all(
      whitelistedVaults(network).map(async (vaultAddress) => {
        let r: AnalyticsData;
        try {
          r = await this.fetchView(network, vaultAddress);
        } catch {
          r = [];
        }
        const data = r.map((p) => {
          return {
            vaultAddress,
            timestamp: p['Timestamp'] as number,
            totalAPY: this._convertOrNull(
              p['Total Strategy APY'],
              (d) => d * 100
            ),
            returnDrivers: Object.keys(p)
              .filter((k) => k !== 'Timestamp' && k !== 'Day')
              .reduce(
                (o, k) =>
                  Object.assign(o, {
                    [k]: this._convertOrNull(p[k], (d) => d * 100),
                  }),
                {} as Record<string, number | null>
              ),
          } as VaultData[number];
        });

        return [vaultAddress.toLowerCase(), data] as [string, VaultData];
      })
    );

    return {
      values: [
        ...vaults,
        [
          'historicalOracles',
          Object.values(historicalOracles) as HistoricalOracles,
        ],
        ['historicalTrading', historicalTrading as HistoricalTrading],
        ['vaultReinvestment', vaultReinvestment as VaultReinvestment],
        ['activeAccounts', activeAccounts as ActiveAccounts],
      ],
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: blockNumber,
    } as CacheSchema<unknown>;
  }

  protected async _refreshAllNetwork() {
    const flatData = await this.fetchView(
      Network.all,
      'historical_oracle_values'
    );
    const historicalOracles = flatData.reduce((acc, p) => {
      const id = `${p['base']}:${p['quote']}:${p['oracle_type']}`;
      if (!acc[id]) {
        acc[id] = {
          id,
          oracleAddress: p['oracle_address'] as string,
          network: Network.all,
          oracleType: p['oracle_type'] as OracleType,
          base: p['base'] as string,
          quote: p['quote'] as string,
          decimals: p['decimals'] as number,
          latestRate: '0',
          historicalRates: [],
        };
      }

      acc[id].historicalRates.push({
        timestamp: p['timestamp'] as number,
        blockNumber: 0,
        rate: p['latest_rate'] as string,
        totalSupply: null,
        tvlUnderlying: null,
      });

      return acc;
    }, {} as Record<string, HistoricalOracles[number]>);

    return {
      values: [['historicalOracles', Object.values(historicalOracles)]] as [
        string,
        unknown
      ][],
      network: Network.all,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    } as CacheSchema<unknown>;
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
