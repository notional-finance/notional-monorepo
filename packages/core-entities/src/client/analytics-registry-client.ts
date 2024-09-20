import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
  floorToMidnight,
  getMidnightUTC,
  percentChange,
  SupportedNetworks,
  getNowSeconds,
} from '@notional-finance/util';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';
import {
  OracleDefinition,
  PriceChange,
  TokenDefinition,
  HistoricalOracles,
  HistoricalTrading,
  VaultData,
  CacheSchema,
  VaultReinvestment,
  AccountHistory,
} from '../Definitions';
import {
  ASSET_PRICE_ORACLES,
  ActiveAccounts,
} from '../server/analytics-server';
import { PRICE_ORACLES } from './oracle-registry-client';
import { TokenBalance } from '../token-balance';
import { FiatKeys } from '../config/fiat-config';
import {
  fetchGraph,
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from '../server/server-registry';
import { parseTransaction } from './accounts/transaction-history';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Transaction } from '../.graphclient';
import { getSecondaryTokenIncentive } from '../config/whitelisted-tokens';
import { whitelistedVaults } from '../config/whitelisted-vaults';

const APY_ORACLES = [
  'fCashOracleRate',
  'PrimeCashPremiumInterestRate',
  'PrimeDebtPremiumInterestRate',
  'nTokenBlendedInterestRate',
  'nTokenFeeRate',
  'nTokenIncentiveRate',
  'nTokenSecondaryIncentiveRate',
  'sNOTEReinvestmentAPY',
] as const;

type Env = {
  NX_SUBGRAPH_API_KEY: string;
};

export class AnalyticsRegistryClient extends ClientRegistry<unknown> {
  constructor(cacheHostname: string, private env: Env) {
    super(cacheHostname);
  }
  protected cachePath() {
    return `${Routes.Analytics}`;
  }

  get USD() {
    return Registry.getTokenRegistry().getTokenBySymbol(Network.all, 'USD');
  }

  get ETH() {
    return Registry.getTokenRegistry().getTokenBySymbol(Network.all, 'ETH');
  }

  protected _getHistoricalOracles(network: Network) {
    return (super.getLatestFromSubject(network, 'historicalOracles') ||
      []) as HistoricalOracles;
  }

  /**
   * Returns a snapshot of PRICE_ORACLE data at a given timestamp in the past.
   * @param network for the given network
   * @param timestamp at this given timestamp, expected to be at midnight UTC
   * @returns OracleDefinition[] for use in the oracle-registry
   */
  getHistoricalOracles(network: Network, timestamp: number) {
    return this._getHistoricalOracles(network)
      .filter(
        (o) =>
          PRICE_ORACLES.includes(o.oracleType) ||
          // Uses oracle rates historically, spot prices are not included in historical
          // oracle query
          o.oracleType === 'fCashOracleRate'
      )
      .map((o) => {
        const { historicalRates, ..._o } = Object.assign({}, o);
        let latestRate = historicalRates.find((r) => r.timestamp === timestamp);
        if (!latestRate) {
          if (o.oracleType === 'fCashSettlementRate') {
            // If there is an fCash settlement rate, it only ever has a single
            // rate. The historical rate will not show up sometimes due to the
            // minTimestamp filter.
            latestRate = {
              rate: o.latestRate as string,
              blockNumber: 0,
              timestamp: timestamp,
              totalSupply: null,
              tvlUnderlying: null,
            };
          } else if (
            o.oracleType === 'Chainlink' &&
            o.base === ZERO_ADDRESS &&
            o.quote === ZERO_ADDRESS
          ) {
            // Fill in the base ETH rate
            latestRate = {
              rate: '1000000000000000000' as string,
              blockNumber: 0,
              timestamp: timestamp,
              totalSupply: null,
              tvlUnderlying: null,
            };
          } else {
            latestRate = {
              rate: '0' as string,
              blockNumber: 0,
              timestamp: timestamp,
              totalSupply: null,
              tvlUnderlying: null,
            };
          }
        }

        return Object.assign(_o, {
          latestRate: {
            rate: BigNumber.from(latestRate.rate),
            blockNumber: latestRate.blockNumber,
            timestamp: latestRate.timestamp,
          },
        }) as OracleDefinition;
      });
  }

  /**
   * Finds the matching token and returns the price history and TVL for the token
   * @param token a given asset token on Notional
   * @returns an array of the historical price and TVL in both underlying and USD
   */
  getPriceHistory(token: TokenDefinition) {
    const tokens = Registry.getTokenRegistry();
    const o = this._getHistoricalOracles(token.network).find(
      (o) => ASSET_PRICE_ORACLES.includes(o.oracleType) && o.quote === token.id
    );

    return (
      o?.historicalRates.map(({ timestamp, rate, tvlUnderlying: tvl }) => {
        const underlying = tokens.getTokenByID(token.network, o.base);
        let tvlUSD: TokenBalance | undefined;
        const precision = BigNumber.from(10).pow(underlying.decimals);
        const rateDecimals = BigNumber.from(10).pow(o.decimals);
        const tvlUnderlying = tvl
          ? TokenBalance.from(
              BigNumber.from(tvl).mul(precision).div(INTERNAL_TOKEN_PRECISION),
              underlying
            )
          : undefined;

        try {
          tvlUSD = tvlUnderlying
            ? tvlUnderlying.toFiat('USD', timestamp)
            : undefined;
        } catch (e) {
          console.log(e);
        }
        return {
          timestamp,
          // Rate will be quoted in underlying terms
          priceInUnderlying: TokenBalance.from(
            BigNumber.from(rate).mul(precision).div(rateDecimals),
            underlying
          ),
          tvlUSD,
          tvlUnderlying,
        };
      }) || []
    );
  }

  getOracleName(
    oracleType: (typeof APY_ORACLES)[number],
    incentiveSymbol?: string
  ) {
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
    }
  }

  getHistoricalAPY(
    token: TokenDefinition
  ): { timestamp: number; totalAPY: number; [key: string]: number }[] {
    if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      return this.getVault(token.network, token.vaultAddress).map(
        ({ timestamp, totalAPY, returnDrivers }) => ({
          timestamp,
          totalAPY: totalAPY || 0,
          ...returnDrivers,
        })
      );
    }

    const oracles = this._getHistoricalOracles(token.network).filter(
      (o) =>
        o.quote === token.id &&
        APY_ORACLES.includes(o.oracleType as (typeof APY_ORACLES)[number])
    );

    if (oracles.length === 1) {
      return oracles[0].historicalRates.map(({ timestamp, rate }) => {
        return {
          timestamp,
          totalAPY: (parseFloat(rate) / RATE_PRECISION) * 100,
        };
      });
    } else if (oracles.length > 1) {
      // Reduce across the multiple oracles and the given time frame and output all the
      // APY components, slice off the first timestamp to eliminate some race / timing
      // conditions
      const allTimestamps = oracles[0].historicalRates
        .map((h) => h.timestamp)
        .sort()
        .slice(2);
      const tokens = Registry.getTokenRegistry();

      return allTimestamps.map((t) => {
        const apyComponents = oracles.reduce(
          (acc, o) => {
            const r = o.historicalRates.find((h) => h.timestamp === t);
            let apy = 0;
            if (r) {
              apy = (parseFloat(r.rate) / RATE_PRECISION) * 100;
              const incentiveSymbol =
                o.oracleType === 'nTokenSecondaryIncentiveRate'
                  ? getSecondaryTokenIncentive(token.network, o.base)
                  : undefined;

              try {
                if (o.oracleType === 'nTokenIncentiveRate') {
                  apy = TokenBalance.fromFloat(
                    apy.toFixed(8),
                    tokens.getTokenBySymbol(token.network, 'NOTE')
                  )
                    .toToken(
                      tokens.getTokenByID(token.network, o.base),
                      'None',
                      floorToMidnight(r.timestamp)
                    )
                    .toFloat();
                } else if (incentiveSymbol) {
                  apy = TokenBalance.fromFloat(
                    (apy / INTERNAL_TOKEN_PRECISION).toFixed(8),
                    tokens.getTokenBySymbol(token.network, incentiveSymbol)
                  )
                    .toToken(
                      tokens.getTokenByID(token.network, o.base),
                      'None',
                      floorToMidnight(r.timestamp)
                    )
                    .toFloat();
                }
              } catch (e) {
                // Errors may occur around UTC midnight when not all the oracles have fully
                // updated.
                console.error(e);
              }

              acc[
                this.getOracleName(
                  o.oracleType as (typeof APY_ORACLES)[number],
                  incentiveSymbol
                )
              ] = apy;
            }
            acc['totalAPY'] += apy;
            return acc;
          },
          { totalAPY: 0 } as { totalAPY: number; [key: string]: number }
        );

        return {
          timestamp: t,
          ...apyComponents,
        };
      });
    } else {
      return [];
    }
  }

  getNTokenFeeRate(token: TokenDefinition) {
    try {
      const apyData = this.getHistoricalAPY(token);

      if (apyData.length === 0) return 0;
      else return apyData[apyData.length - 1]['Trading Fees'] || 0;
    } catch {
      return 0;
    }
  }

  getVault(network: Network, vaultAddress: string) {
    return (super.getLatestFromSubject(network, vaultAddress) ||
      []) as VaultData;
  }

  getActiveAccounts(network: Network) {
    return (super.getLatestFromSubject(network, 'activeAccounts', 0) ||
      {}) as ActiveAccounts;
  }

  getHistoricalTrading(network: Network) {
    return (super.getLatestFromSubject(network, 'historicalTrading', 0) ||
      {}) as HistoricalTrading;
  }

  getVaultReinvestments(network: Network) {
    return (super.getLatestFromSubject(network, 'vaultReinvestment', 0) ||
      {}) as VaultReinvestment;
  }

  getKPIs() {
    const totalValueLocked = SupportedNetworks.reduce((t, n) => {
      return (
        t +
        Registry.getTokenRegistry()
          .getAllTokens(n)
          .filter(
            (t) =>
              t.tokenType === 'PrimeDebt' ||
              t.tokenType === 'PrimeCash' ||
              t.tokenType === 'VaultShare'
          )
          .reduce(
            (acc, token) =>
              acc +
              (token.tokenType === 'PrimeDebt'
                ? token.totalSupply?.toFiat('USD').neg().toFloat() || 0
                : token.totalSupply?.toFiat('USD').toFloat() || 0),
            0
          )
      );
    }, 0);

    const totalOpenDebt = SupportedNetworks.reduce((t, n) => {
      return (
        t +
        Registry.getTokenRegistry()
          .getAllTokens(n)
          .filter(
            (t) =>
              t.tokenType === 'PrimeDebt' ||
              // Non-Matured fCash
              (t.tokenType === 'fCash' &&
                t.isFCashDebt === false &&
                t.maturity &&
                getNowSeconds() < t.maturity)
          )
          .reduce((acc, token) => {
            let value = token.totalSupply?.toFiat('USD').toFloat() || 0;
            if (token.tokenType === 'fCash' && token.currencyId) {
              const m = Registry.getExchangeRegistry().getfCashMarket(
                token.network,
                token.currencyId
              );

              // Take the net of the total debt outstanding and the debt held by the nToken
              value =
                value +
                (m.poolParams.nTokenFCash
                  .find((t) => t.tokenId === token.id)
                  ?.toFiat('USD')
                  .toFloat() || 0);
            }

            return acc + value;
          }, 0)
      );
    }, 0);

    const totalAccounts = SupportedNetworks.reduce(
      (t, n) =>
        t +
        (this.isNetworkRegistered(n)
          ? this.getActiveAccounts(n)['totalActive'] || 0
          : 0),
      0
    );

    return {
      totalDeposits: totalValueLocked + totalOpenDebt,
      totalOpenDebt,
      totalAccounts,
    };
  }

  getPriceChanges(
    base: FiatKeys,
    network: Network,
    timeRange: number
  ): PriceChange[] {
    return Registry.getTokenRegistry()
      .getAllTokens(network)
      .filter((t) => t.currencyId !== undefined)
      .filter((t) =>
        t.tokenType === 'VaultShare' || t.tokenType === 'VaultDebt'
          ? whitelistedVaults(network).includes(t.vaultAddress || '')
          : true
      )
      .map((t) => {
        const unit = TokenBalance.unit(t);
        const midnight = getMidnightUTC();
        const pastDate = midnight - timeRange;
        const currentUnderlying = unit.toUnderlying();
        const currentFiat = unit.toFiat(base);
        let pastUnderlying: TokenBalance | undefined;
        let pastFiat: TokenBalance | undefined;
        try {
          pastUnderlying = unit.toUnderlying(pastDate);
          pastFiat = unit.toFiat(base, pastDate);
        } catch {
          pastUnderlying = undefined;
          pastFiat = undefined;
        }

        return {
          asset: t,
          pastDate: pastDate,
          currentUnderlying,
          currentFiat,
          pastUnderlying,
          pastFiat,
          fiatChange: percentChange(currentFiat.toFloat(), pastFiat?.toFloat()),
          underlyingChange: percentChange(
            currentUnderlying.toFloat(),
            pastUnderlying?.toFloat()
          ),
        };
      });
  }

  async getNetworkTransactions(network: Network, skip: number) {
    const { NetworkTransactionHistoryDocument } =
      await loadGraphClientDeferred();
    return await fetchGraph(
      network,
      NetworkTransactionHistoryDocument,
      (r): Record<string, AccountHistory[]> => {
        return {
          [network]: r.transactions
            .map((t) => {
              return parseTransaction(t as Transaction, network);
            })
            .flatMap((_) => _),
        };
      },
      this.env.NX_SUBGRAPH_API_KEY,
      {
        skip,
      }
    );
  }

  protected override async _refresh(
    network: Network
  ): Promise<CacheSchema<unknown>> {
    return this._fetch(network, 'analytics');
  }

  async getPointPrices() {
    return this.getView<{ points: string; price: string }>(
      Network.all,
      'points_prices'
    ).then((m) =>
      m.map(({ points, price }) => ({ points, price: parseFloat(price) || 0 }))
    );
  }

  async getTotalPoints() {
    return this.getView<{
      season_one: string;
      season_two: string;
      season_three: string;
    }>(Network.arbitrum, 'total_points').then((v) => {
      const d = v[0];
      return {
        season_one: parseFloat(d['season_one']),
        season_two: parseFloat(d['season_two']),
        season_three: parseFloat(d['season_three']),
      };
    });
  }

  async getExchangeRateValues(
    network: Network,
    oracle: OracleDefinition,
    // NOTE: can set this to a 90 day window or something by default
    minTimestamp = 0
  ) {
    const { ExchangeRateValuesDocument } = await loadGraphClientDeferred();
    return fetchGraphPaginate(
      network,
      ExchangeRateValuesDocument,
      'exchangeRates',
      this.env.NX_SUBGRAPH_API_KEY,
      {
        oracleId: oracle.id,
        minTimestamp,
      }
    );
  }

  async getAccountRisk(network: Network) {
    const vaultRisk = ClientRegistry.fetch<
      {
        account: string;
        vaultAddress: string;
        vaultName: string;
        riskFactors: {
          netWorth: TokenBalance;
          debts: TokenBalance;
          assets: TokenBalance;
          collateralRatio: number | null;
          healthFactor: number | null;
          liquidationPrice: {
            asset: TokenDefinition;
            threshold: TokenBalance | null;
            isDebtThreshold: boolean;
          }[];
          aboveMaxLeverageRatio: boolean;
          leverageRatio: number | null;
        };
      }[]
    >(`${this.cacheHostname}/${network}`, 'accounts/vaultRisk');
    const portfolioRisk = ClientRegistry.fetch<
      {
        address: string;
        hasCrossCurrencyRisk: boolean;
        riskFactors: {
          netWorth: TokenBalance;
          freeCollateral: TokenBalance;
          loanToValue: number;
          collateralRatio: number | null;
          leverageRatio: number | null;
          healthFactor: number | null;
          liquidationPrice: {
            asset: TokenDefinition;
            threshold: TokenBalance | null;
            isDebtThreshold: boolean;
          }[];
        };
      }[]
    >(`${this.cacheHostname}/${network}`, 'accounts/portfolioRisk');

    return { vaultRisk, portfolioRisk };
  }

  async getView<T>(network: Network, viewName: string) {
    return this._fetch<T[]>(network, viewName);
  }
}
