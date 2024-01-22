import {
  PriceChange,
  Registry,
  YieldData,
} from '@notional-finance/core-entities';
import {
  Network,
  SECONDS_IN_DAY,
  SupportedNetworks,
} from '@notional-finance/util';
import {
  Observable,
  distinctUntilChanged,
  filter,
  map,
  merge,
  switchMap,
  timer,
} from 'rxjs';
import { GlobalState } from '../global-state';
import { isAppReady } from '../../utils';
import { globalWhenAppReady$ } from './on-app-load';

export function onDataUpdate(global$: Observable<GlobalState>) {
  return merge(
    onYieldsUpdate$(global$),
    onPriceChangeUpdate$(global$),
    onActiveAccounts$(global$)
  );
}

function onYieldsUpdate$(global$: Observable<GlobalState>) {
  return globalWhenAppReady$(global$).pipe(
    // TODO: need hard waits on yield and analytics registry ready...
    switchMap(() => {
      return timer(500, 10_000).pipe(
        map(() => {
          return {
            allYields: SupportedNetworks.reduce((acc, n) => {
              acc[n] = Registry.getYieldRegistry().getAllYields(n);
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

            return acc;
          }, {} as Record<Network, { oneDay: PriceChange[]; sevenDay: PriceChange[] }>),
        }))
      );
    })
  );
}

function onActiveAccounts$(global$: Observable<GlobalState>) {
  return global$.pipe(
    distinctUntilChanged(
      (p, c) =>
        isAppReady(p.networkState) === isAppReady(c.networkState) &&
        c.baseCurrency === p.baseCurrency
    ),
    filter((g) => isAppReady(g.networkState)),
    switchMap(() => {
      return timer(500, 60_000).pipe(
        map(() => ({
          activeAccounts: SupportedNetworks.reduce((acc, n) => {
            acc[n] = Registry.getAnalyticsRegistry().getActiveAccounts(n);
            return acc;
          }, {} as Record<Network, Record<string, number>>),
        }))
      );
    })
  );
}
