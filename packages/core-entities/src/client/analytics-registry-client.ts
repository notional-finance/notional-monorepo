import {
  ExtractObservableReturn,
  Network,
  RATE_PRECISION,
} from '@notional-finance/util';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import { map, take, Observable } from 'rxjs';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';
import { OracleDefinition } from '../Definitions';
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
    return Routes.Analytics;
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
              const latestRate = historicalRates.find(
                (r) => r.timestamp === timestamp
              );
              if (!latestRate) throw Error(`latest rate not found for ${o.id}`);

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
            const token = tokens.getTokenByID(network, o.base);
            return {
              token,
              data: o.historicalRates.map(({ timestamp, rate }) => ({
                timestamp,
                rate: TokenBalance.from(BigNumber.from(rate), token),
              })),
            };
          });
      })
    );
  }

  subscribeHistoricalAPY(network: Network) {
    this.subscribeSubject<HistoricalOracles>(
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
                data: vaultData?.map(({ timestamp, totalAPY }) => ({
                  timestamp,
                  rate: totalAPY || 0,
                })),
              };
            });
        });

        const o = oracles
          ?.filter((o) => APY_ORACLES.includes(o.oracleType))
          .map((o) => ({
            token: tokens.getTokenByID(network, o.base),
            data: o.historicalRates.map(({ timestamp, rate }) => ({
              timestamp,
              rate: (parseFloat(rate) / RATE_PRECISION) * 100,
            })),
          }));

        return v.concat(o);
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

  getVault(network: Network, vaultAddress: string) {
    return this._getLatest(this.subscribeVault(network, vaultAddress));
  }

  async getView<T>(network: Network, viewName: string) {
    return this._fetch<T[]>(network, viewName);
  }
}
