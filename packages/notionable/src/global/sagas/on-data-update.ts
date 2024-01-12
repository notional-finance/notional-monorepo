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
  combineLatest,
  distinctUntilChanged,
  interval,
  map,
  merge,
} from 'rxjs';
import { GlobalState } from '../global-state';

export function onDataUpdate(global$: Observable<GlobalState>) {
  return merge(onYieldsUpdate$(), onPriceChangeUpdate$(global$));
}

function onYieldsUpdate$() {
  return interval(5_000).pipe(
    map(() => {
      return {
        allYields: SupportedNetworks.reduce((acc, n) => {
          acc[n] = Registry.getYieldRegistry().getAllYields(n);
          return acc;
        }, {} as Record<Network, YieldData[]>),
      };
    })
  );
}

function onPriceChangeUpdate$(global$: Observable<GlobalState>) {
  return combineLatest([global$, interval(60_000)]).pipe(
    distinctUntilChanged(
      (p, c) => c[1] === p[1] && c[0].baseCurrency === p[0].baseCurrency
    ),
    map(([global, _]) => {
      return {
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
      };
    })
  );
}
