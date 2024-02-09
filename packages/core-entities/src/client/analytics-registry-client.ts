import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
  floorToMidnight,
  getMidnightUTC,
  percentChange,
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
} from '../Definitions';
import {
  ASSET_PRICE_ORACLES,
  ActiveAccounts,
} from '../server/analytics-server';
import { PRICE_ORACLES } from './oracle-registry-client';
import { TokenBalance } from '../token-balance';
import { FiatKeys } from '../config/fiat-config';

const APY_ORACLES = [
  'fCashOracleRate',
  'PrimeCashPremiumInterestRate',
  'PrimeDebtPremiumInterestRate',
  'nTokenBlendedInterestRate',
  'nTokenFeeRate',
  'nTokenIncentiveRate',
  'nTokenSecondaryIncentiveRate',
];

export class AnalyticsRegistryClient extends ClientRegistry<unknown> {
  protected cachePath() {
    return `${Routes.Analytics}/analytics`;
  }

  get USD() {
    return Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'USD');
  }

  get ETH() {
    return Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'ETH');
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
      .filter((o) => PRICE_ORACLES.includes(o.oracleType))
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

  getHistoricalAPY(
    token: TokenDefinition
  ): { timestamp: number; totalAPY: number; [key: string]: number }[] {
    if (token.tokenType === 'VaultShare' && token.vaultAddress) {
      return this.getVault(token.network, token.vaultAddress).map(
        ({ timestamp, totalAPY }) => ({
          timestamp,
          totalAPY: totalAPY || 0,
        })
      );
    }

    const oracles = this._getHistoricalOracles(token.network).filter(
      (o) => o.quote === token.id && APY_ORACLES.includes(o.oracleType)
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
        .slice(1);
      const tokens = Registry.getTokenRegistry();

      return allTimestamps.map((t) => {
        const apyComponents = oracles.reduce(
          (acc, o) => {
            const r = o.historicalRates.find((h) => h.timestamp === t);
            let apy = 0;
            if (r) {
              apy = (parseFloat(r.rate) / RATE_PRECISION) * 100;

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
              } else if (o.oracleType === 'nTokenSecondaryIncentiveRate') {
                // NOTE: this token is currently hardcoded but we will need to make it configurable
                // at some point in the future.
                apy = TokenBalance.fromFloat(
                  (apy / INTERNAL_TOKEN_PRECISION).toFixed(8),
                  tokens.getTokenBySymbol(token.network, 'ARB')
                )
                  .toToken(
                    tokens.getTokenByID(token.network, o.base),
                    'None',
                    floorToMidnight(r.timestamp)
                  )
                  .toFloat();
              }

              acc[o.oracleType] = apy;
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
    const apyData = this.getHistoricalAPY(token);

    if (apyData.length === 0) return 0;
    else return apyData[apyData.length - 1]['nTokenFeeRate'] || 0;
  }

  getVault(network: Network, vaultAddress: string) {
    return (super.getLatestFromSubject(network, vaultAddress) ||
      []) as VaultData;
  }

  getActiveAccounts(network: Network) {
    return (super.getLatestFromSubject(network, 'activeAccounts') ||
      {}) as ActiveAccounts;
  }

  getHistoricalTrading(network: Network) {
    return (super.getLatestFromSubject(network, 'historicalTrading') ||
      {}) as HistoricalTrading;
  }

  getPriceChanges(
    base: FiatKeys,
    network: Network,
    timeRange: number
  ): PriceChange[] {
    return Registry.getTokenRegistry()
      .getAllTokens(network)
      .filter((t) => t.currencyId !== undefined)
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

  async getView<T>(network: Network, viewName: string) {
    return this._fetch<T[]>(network, viewName);
  }
}
