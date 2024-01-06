import { ActiveAccountsDocument, OracleType } from '../.graphclient';
import { AnalyticsData, CacheSchema } from '../Definitions';
import crossFetch from 'cross-fetch';
import {
  fetchGraph,
  loadGraphClientDeferred,
  ServerRegistry,
} from './server-registry';
import {
  convertArrayToObject,
  getNowSeconds,
  groupArrayToMap,
  Network,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { whitelistedVaults } from '../config/whitelisted-vaults';
import { floorToMidnight } from '@notional-finance/helpers';

const USE_CROSS_FETCH =
  process.env['NX_USE_CROSS_FETCH'] || process.env['NODE_ENV'] == 'test';
const DATA_SERVICE_URL = process.env['DATA_SERVICE_URL'];
const DATA_SERVICE_AUTH_TOKEN = process.env[
  'DATA_SERVICE_AUTH_TOKEN'
] as string;

export type VaultData = {
  vaultAddress: string;
  timestamp: number;
  totalAPY: number | null;
  returnDrivers: Record<string, number | null>;
}[];

type HistoricalRate = {
  blockNumber: number;
  timestamp: number;
  rate: string;
};

export type HistoricalOracles = {
  id: string;
  oracleAddress: string;
  network: Network;
  oracleType: OracleType;
  base: string;
  quote: string;
  decimals: number;
  historicalRates: HistoricalRate[];
}[];

export type HistoricalTrading = Record<
  string,
  {
    bundleName: string;
    currencyId: number;
    fCashId: string;
    fCashValue: string;
    pCash: string;
    pCashInUnderlying: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }[]
>;

export type VaultReinvestment = Record<
  string,
  {
    vault: string;
    blockNumber: any;
    timestamp: number;
    transactionHash: any;
    rewardTokenSold: any;
    rewardAmountSold: any;
    tokensReinvested: any;
    tokensPerVaultShare?: any;
    underlyingAmountRealized?: any;
  }[]
>;

export type ActiveAccounts = Record<string, number>;

export class AnalyticsServer extends ServerRegistry<unknown> {
  protected async _refresh(network: Network) {
    if (network === Network.All) {
      return this._refreshAllNetwork();
    }

    const {
      HistoricalOracleValuesDocument,
      HistoricalTradingActivityDocument,
      VaultReinvestmentDocument,
    } = await loadGraphClientDeferred();
    const minTimestamp = getNowSeconds() - 90 * SECONDS_IN_DAY;

    const { finalResults: historicalOracles, blockNumber } = await fetchGraph(
      network,
      HistoricalOracleValuesDocument,
      // Key = oracleId
      (r) =>
        convertArrayToObject(
          r.oracles.map((o) => ({
            id: o.id,
            oracleAddress: o.oracleAddress,
            network,
            oracleType: o.oracleType,
            base: o.base.id,
            quote: o.quote.id,
            decimals: o.decimals,
            historicalRates:
              // This is sorted ascending in the query so we always take the first value closest
              // to midnight
              o.historicalRates?.reduce((acc, r) => {
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
                  });
                  return acc;
                }
              }, [] as HistoricalRate[]) || [],
          })),
          'id'
        ),
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
      {},
      'accounts'
    );

    const vaults = await Promise.all(
      whitelistedVaults(network).map(async (vaultAddress) => {
        const r = await this._fetchView(network, vaultAddress);
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
    const flatData = await this._fetchView(
      Network.All,
      'historical_oracle_values'
    );
    const historicalOracles = flatData.reduce((acc, p) => {
      const id = `${p['base']}:${p['quote']}:${p['oracle_type']}`;
      if (!acc[id]) {
        acc[id] = {
          id,
          oracleAddress: p['oracle_address'] as string,
          network: Network.All,
          oracleType: p['oracle_type'] as OracleType,
          base: p['base'] as string,
          quote: p['quote'] as string,
          decimals: p['decimals'] as number,
          historicalRates: [],
        };
      }

      acc[id].historicalRates.push({
        timestamp: p['timestamp'] as number,
        blockNumber: 0,
        rate: p['latest_rate'] as string,
      });

      return acc;
    }, {} as Record<string, HistoricalOracles[number]>);

    return {
      values: ['historicalOracles', Object.values(historicalOracles)] as [
        string,
        unknown
      ],
      network: Network.All,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    } as CacheSchema<unknown>;
  }

  protected async _fetchView(
    network: Network,
    view: string
  ): Promise<AnalyticsData> {
    const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
    const cacheUrl = `${DATA_SERVICE_URL}/query?network=${network}&view=${view}`;
    const result = await _fetch(cacheUrl, {
      headers: {
        'x-auth-token': DATA_SERVICE_AUTH_TOKEN,
      },
    });
    const body = await result.text();
    if (result.status !== 200) throw Error(`Failed Request: ${body}`);
    return JSON.parse(body);
  }

  private _convertOrNull<T>(v: string | number | null, fn: (d: number) => T) {
    if (v === null) return null;
    else if (typeof v === 'string') return fn(parseFloat(v));
    else return fn(v);
  }
}
