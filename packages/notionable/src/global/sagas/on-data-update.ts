import {
  Registry,
  TokenBalance,
  fCashMarket,
  HistoricalTrading,
} from '@notional-finance/core-entities';
import { formatNumberAsPercent, getFromLocalStorage } from '@notional-finance/helpers';
import {
  Network,
  SECONDS_IN_DAY,
  RATE_PRECISION,
} from '@notional-finance/util';
import {
  Observable,
  map,
  merge,
  switchMap,
  take,
  timer,
  withLatestFrom,
} from 'rxjs';
import { CalculatedPriceChanges, GlobalState } from '../global-state';
import { globalWhenAppReady$ } from './on-app-load';
import { getIndexedYields } from '../data/yields';
const userSettings = getFromLocalStorage('userSettings');

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
      return timer(0, 60_000).pipe(
        map(() => {
          return {
            allYields: networks.reduce((acc, n) => {
              // Skips yield registries that are not registered
              if (Registry.getYieldRegistry().isNetworkRegistered(n)) {
                acc[n] = getIndexedYields(
                  n,
                  Registry.getYieldRegistry().getAllYields(n)
                );
              }
              return acc;
            }, {} as Record<Network, ReturnType<typeof getIndexedYields>>),
          };
        })
      );
    })
  );
}

function onPriceChangeUpdate$(global$: Observable<GlobalState>) {
  return globalWhenAppReady$(global$).pipe(
    take(1),
    switchMap(() => Registry.getAnalyticsRegistry().subscribeNetworks()),
    switchMap((networks) => {
      return timer(0, 60_000).pipe(
        withLatestFrom(global$),
        map(([_]) => ({
          priceChanges: networks.reduce((acc, n) => {
            if (Registry.getAnalyticsRegistry().isNetworkRegistered(n)) {
              acc[n] = {
                oneDay: Registry.getAnalyticsRegistry().getPriceChanges(
                  userSettings.baseCurrency,
                  n,
                  SECONDS_IN_DAY
                ),
                threeDay: Registry.getAnalyticsRegistry().getPriceChanges(
                  userSettings.baseCurrency,
                  n,
                  SECONDS_IN_DAY * 3
                ),
                sevenDay: Registry.getAnalyticsRegistry().getPriceChanges(
                  userSettings.baseCurrency,
                  n,
                  SECONDS_IN_DAY * 7
                ),
              };
            }
            return acc;
          }, {} as Record<Network, CalculatedPriceChanges>),
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
          heroStats: Registry.getAnalyticsRegistry().getKPIs(),
          activeAccounts: networks.reduce((acc, n) => {
            if (Registry.getAnalyticsRegistry().isNetworkRegistered(n)) {
              acc[n] = Registry.getAnalyticsRegistry().getActiveAccounts(n);
            }
            return acc;
          }, {} as Record<Network, Record<string, number>>),
          historicalTrading: networks.reduce((acc, n) => {
            if (Registry.getAnalyticsRegistry().isNetworkRegistered(n)) {
              const historicalData =
                Registry.getAnalyticsRegistry().getHistoricalTrading(n);
              for (const key in historicalData) {
                try {
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
                } catch {
                  // No-Op, this can fail when restricting the max currency id
                }
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
