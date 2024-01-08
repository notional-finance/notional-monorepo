import {
  ExtractObservableReturn,
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import { map, take, Observable } from 'rxjs';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';
import { OracleDefinition, TokenDefinition } from '../Definitions';
import { HistoricalOracles, VaultData } from '../server/analytics-server';
import { PRICE_ORACLES } from './oracle-registry-client';
import { TokenBalance } from '../token-balance';
import { whitelistedVaults } from '../config/whitelisted-vaults';

const APY_ORACLES = [
  'fCashOracleRate',
  'PrimeCashPremiumInterestRate',
  'PrimeDebtPremiumInterestRate',
  'nTokenBlendedInterestRate',
  'nTokenFeeRate',
  'nTokenIncentiveRate',
];
const ASSET_PRICE_ORACLES = [
  'nTokenToUnderlyingExchangeRate',
  'PrimeCashToUnderlyingExchangeRate',
  'VaultShareOracleRate',
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

  private _getLatest<T>(o: Observable<T> | undefined) {
    let data: ExtractObservableReturn<typeof o> | undefined;

    o?.pipe(take(1)).forEach((d) => (data = d));
    return data;
  }

  override subscribeSubject<T>(network: Network, key: string) {
    return super.subscribeSubject(network, key) as Observable<T> | undefined;
  }

  subscribeHistoricalOracles(network: Network, timestamp: number) {
    return this.subscribeSubject<HistoricalOracles>(
      network,
      'historicalOracles'
    )?.pipe(
      map((d) => {
        return (
          d
            .filter((o) => PRICE_ORACLES.includes(o.oracleType))
            .map((o) => {
              const { historicalRates, ..._o } = Object.assign({}, o);
              let latestRate = historicalRates.find(
                (r) => r.timestamp === timestamp
              );
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
                  };
                } else {
                  latestRate = {
                    rate: '0' as string,
                    blockNumber: 0,
                    timestamp: timestamp,
                    totalSupply: null,
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
            }) || []
        );
      })
    );
  }

  subscribeHistoricalPrice(network: Network) {
    return this.subscribeSubject<HistoricalOracles>(
      network,
      'historicalOracles'
    )?.pipe(
      map((d) => {
        const tokens = Registry.getTokenRegistry();
        return d
          .filter((o) => ASSET_PRICE_ORACLES.includes(o.oracleType))
          .map((o) => {
            return {
              token: tokens.getTokenByID(network, o.quote),
              data: o.historicalRates.map(
                ({ timestamp, rate, totalSupply }) => {
                  const underlying = tokens.getTokenByID(network, o.base);
                  const token = tokens.getTokenByID(network, o.quote);
                  let tvlUnderlying: TokenBalance | undefined;
                  let tvlUSD: TokenBalance | undefined;

                  try {
                    tvlUnderlying = totalSupply
                      ? TokenBalance.from(totalSupply, token).toUnderlying(
                          timestamp
                        )
                      : undefined;
                    tvlUSD = totalSupply
                      ? TokenBalance.from(totalSupply, token).toFiat(
                          'USD',
                          timestamp
                        )
                      : undefined;
                  } catch (e) {
                    console.log(e);
                  }
                  return {
                    timestamp,
                    // Rate will be quoted in underlying terms
                    priceInUnderlying: TokenBalance.from(
                      BigNumber.from(rate),
                      underlying
                    ),
                    tvlUSD,
                    tvlUnderlying,
                  };
                }
              ),
            };
          });
      })
    );
  }

  subscribeHistoricalAPY(network: Network) {
    return this.subscribeSubject<HistoricalOracles>(
      network,
      'historicalOracles'
    )?.pipe(
      map((oracles) => {
        const tokens = Registry.getTokenRegistry();
        const config = Registry.getConfigurationRegistry();
        const v = whitelistedVaults(network).flatMap((vaultAddress) => {
          const vaultData = this.getLatestFromSubject(network, vaultAddress) as
            | VaultData
            | undefined;
          return config
            .getVaultActiveMaturities(network, vaultAddress)
            .map((maturity) => {
              const vaultShare = tokens.getVaultShare(
                network,
                vaultAddress,
                maturity
              );

              return {
                token: vaultShare,
                oracleType: 'VaultShareAPY' as OracleDefinition['oracleType'],
                data: vaultData?.map(({ timestamp, totalAPY }) => ({
                  timestamp,
                  totalAPY: totalAPY || 0,
                })),
              };
            });
        });

        const nTokenTotalAPY = new Map<string, Map<number, number>>();

        const o = oracles
          .filter((o) => APY_ORACLES.includes(o.oracleType))
          .map((o) => {
            const token = tokens.getTokenByID(network, o.quote);
            return {
              // Quote token will the the nToken, pCash, etc.
              token,
              oracleType: o.oracleType as OracleDefinition['oracleType'],
              data: o.historicalRates.map(({ timestamp, rate }) => {
                let totalAPY = (parseFloat(rate) / RATE_PRECISION) * 100;
                try {
                  if (o.oracleType === 'nTokenIncentiveRate') {
                    totalAPY = TokenBalance.fromFloat(
                      totalAPY.toFixed(8),
                      tokens.getTokenBySymbol(network, 'NOTE')
                    )
                      .toToken(tokens.getTokenByID(network, o.base))
                      .toFloat();
                  }
                } catch {
                  totalAPY = 0;
                }

                // Accumulate the sum for the total nToken APY
                if (token.tokenType === 'nToken') {
                  if (!nTokenTotalAPY.has(token.id))
                    nTokenTotalAPY.set(token.id, new Map<number, number>());
                  const map = nTokenTotalAPY.get(token.id)!;
                  map.set(timestamp, (map.get(timestamp) || 0) + totalAPY);
                }

                return {
                  timestamp,
                  totalAPY,
                };
              }),
            };
          });

        const t = Array.from(nTokenTotalAPY.entries()).map(([id, t]) => {
          const token = tokens.getTokenByID(network, id);
          return {
            token,
            oracleType: 'nTokenTotalAPY' as OracleDefinition['oracleType'],
            data: Array.from(t.entries()).map(([timestamp, totalAPY]) => ({
              timestamp,
              totalAPY,
            })),
          };
        });

        return v.concat(o).concat(t);
      })
    );
  }

  subscribeVault(network: Network, vaultAddress: string) {
    return this.subscribeSubject<VaultData>(
      network,
      vaultAddress.toLowerCase()
    );
  }

  getHistoricalOracles(network: Network, timestamp: number) {
    return this._getLatest(this.subscribeHistoricalOracles(network, timestamp));
  }

  getNTokenFeeRate(network: Network, token: TokenDefinition) {
    const apyData = this._getLatest(this.subscribeHistoricalAPY(network));
    return apyData?.find(({ token: t, oracleType }) => {
      return oracleType === 'nTokenFeeRate' && t.id === token.id;
    });
  }

  getPriceHistory(network: Network, token: TokenDefinition) {
    const priceData = this._getLatest(this.subscribeHistoricalPrice(network));
    return priceData?.find(({ token: t }) => t.id === token.id);
  }

  getHistoricalAPY(network: Network, token: TokenDefinition) {
    const apyData = this._getLatest(this.subscribeHistoricalAPY(network));
    return apyData?.find(({ token: t, oracleType }) => {
      switch (t.tokenType) {
        case 'nToken':
          return t.id === token.id && oracleType === 'nTokenTotalAPY';
        case 'PrimeCash':
          return (
            t.id === token.id && oracleType === 'PrimeCashPremiumInterestRate'
          );
        case 'PrimeDebt':
          return (
            t.id === token.id && oracleType === 'PrimeDebtPremiumInterestRate'
          );
        case 'VaultShare':
          return t.id === token.id && oracleType === 'VaultShareAPY';
        case 'fCash':
          return t.id === token.id && oracleType === 'fCashOracleRate';
        default:
          return false;
      }
    });
  }

  getVault(network: Network, vaultAddress: string) {
    return this._getLatest(this.subscribeVault(network, vaultAddress));
  }

  async getView<T>(network: Network, viewName: string) {
    return this._fetch<T[]>(network, viewName);
  }
}
