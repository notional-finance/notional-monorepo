import {
  PriceChange,
  YieldData,
  Registry,
  TokenBalance,
  fCashMarket,
  HistoricalTrading,
} from '@notional-finance/core-entities';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import {
  Network,
  SECONDS_IN_DAY,
  SupportedNetworks,
  RATE_PRECISION,
} from '@notional-finance/util';
import {
  Observable,
  distinctUntilChanged,
  filter,
  map,
  merge,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { GlobalState } from '../global-state';
import { isAppReady } from '../../utils';
import { globalWhenAppReady$ } from './on-app-load';

export function onDataUpdate(global$: Observable<GlobalState>) {
  return merge(
    onYieldsUpdate$(global$),
    onPriceChangeUpdate$(global$),
    onAnalyticsReady$(global$)
  );
}

function onYieldsUpdate$(global$: Observable<GlobalState>) {
  return globalWhenAppReady$(global$).pipe(
    take(1),
    switchMap(() => Registry.getYieldRegistry().subscribeNetworks()),
    switchMap((networks) => {
      return timer(0, 10_000).pipe(
        map(() => {
          return {
            allYields: networks.reduce((acc, n) => {
              // Skips yield registries that are not registered
              if (Registry.getYieldRegistry().isNetworkRegistered(n)) {
                acc[n] = Registry.getYieldRegistry().getAllYields(n);
              }
              return acc;
            }, {} as Record<Network, YieldData[]>),
          };
        })
      );
    })
  );
}

function onPriceChangeUpdate$(global$: Observable<GlobalState>) {
  return global$.pipe(
    distinctUntilChanged(
      (p, c) =>
        isAppReady(p.networkState) === isAppReady(c.networkState) &&
        c.baseCurrency === p.baseCurrency
    ),
    filter((g) => isAppReady(g.networkState)),
    switchMap((global) => {
      return timer(500, 60_000).pipe(
        map(() => ({
          priceChanges: SupportedNetworks.reduce((acc, n) => {
            if (Registry.getAnalyticsRegistry().isNetworkRegistered(n)) {
              const oneDay = Registry.getAnalyticsRegistry().getPriceChanges(
                global.baseCurrency,
                n,
                SECONDS_IN_DAY
              );
              const sevenDay = Registry.getAnalyticsRegistry().getPriceChanges(
                global.baseCurrency,
                n,
                SECONDS_IN_DAY * 7
              );
              acc[n] = {
                oneDay,
                sevenDay,
              };
            }
            return acc;
          }, {} as Record<Network, { oneDay: PriceChange[]; sevenDay: PriceChange[] }>),
        }))
      );
    })
  );
}

function onAnalyticsReady$(global$: Observable<GlobalState>) {
  return globalWhenAppReady$(global$).pipe(
    take(1),
    switchMap(() => Registry.getAnalyticsRegistry().subscribeNetworks()),
    switchMap((networks) => {
      return timer(0, 60_000).pipe(
        map(() => ({
          activeAccounts: networks.reduce((acc, n) => {
            if (Registry.getAnalyticsRegistry().isNetworkRegistered(n)) {
              acc[n] = Registry.getAnalyticsRegistry().getActiveAccounts(n);
            }
            return acc;
          }, {} as Record<Network, Record<string, number>>),
          historicalTrading: SupportedNetworks.reduce((acc, n) => {
            if (Registry.getAnalyticsRegistry().isNetworkRegistered(n)) {
              const historicalData =
                Registry.getAnalyticsRegistry().getHistoricalTrading(n);
              for (const key in historicalData) {
                const updatedData = historicalData[key].map((data) => {
                  const fCashTokenBalance = TokenBalance.fromID(
                    data?.fCashValue,
                    data?.fCashId,
                    n
                  );
                  const token = Registry.getTokenRegistry().getUnderlying(
                    n,
                    data.currencyId
                  );
                  const underlyingTokenBalance = TokenBalance.from(
                    data.pCashInUnderlying,
                    token
                  );
                  const interestRate = fCashMarket.getImpliedInterestRate(
                    underlyingTokenBalance,
                    fCashTokenBalance,
                    data.timestamp
                  );
                  return {
                    ...data,
                    interestRate: interestRate
                      ? formatNumberAsPercent(
                          (interestRate * 100) / RATE_PRECISION
                        )
                      : formatNumberAsPercent(0),
                    underlyingTokenBalance,
                    fCashMaturity: fCashTokenBalance.maturity,
                  };
                });
                historicalData[key] = updatedData;
              }

              acc[n] = historicalData;
            }
            return acc;
          }, {} as Record<Network, HistoricalTrading>),
        }))
      );
    })
  );
}
