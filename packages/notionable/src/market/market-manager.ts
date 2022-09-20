import {
  Subject,
  tap,
  timer,
  mergeMap,
  forkJoin,
  switchMap,
  takeUntil,
  finalize,
  exhaustMap,
  of,
  Observable,
  map,
  distinctUntilChanged,
} from 'rxjs';
import { Market, System } from '@notional-finance/sdk-v2/system';
import { CurrencyMarket } from '../types';
import { updateMarketState } from './market-store';
import { notional$ } from '../notional/notional-store';
import { MarketRefreshInterval } from '../notionable.config';

const system$ = notional$.pipe(map((notional) => notional?.system ?? null));

const _marketUpdates = new Subject<Map<number, CurrencyMarket>>();
const marketUpdates$ = _marketUpdates
  .asObservable()
  .pipe(distinctUntilChanged((prev, curr) => areMarketsEqual(prev, curr)));

// Market refresh timers
const _startRefresh = new Subject();
const startRefresh$ = _startRefresh.asObservable();

const _stopRefresh = new Subject();
const stopRefresh$ = _stopRefresh
  .asObservable()
  .pipe(tap(() => console.log('stop wallet refresh')));

const _refreshMarkets$ = system$.pipe(
  getAllMarkets,
  map((currencyMarkets) => {
    _marketUpdates.next(currencyMarkets);
  })
);

const _marketRefreshTimer$ = timer(0, MarketRefreshInterval).pipe(
  switchMap(() => _refreshMarkets$),
  takeUntil(stopRefresh$),
  finalize(() => console.log('market refresh complete'))
);

startRefresh$
  .pipe(
    tap(() => console.log('start market refresh')),
    exhaustMap(() => _marketRefreshTimer$)
  )
  .subscribe();

system$.subscribe((system) => {
  if (system) {
    _startRefresh.next(true);
  } else {
    _stopRefresh.next(true);
  }
});

function getAllMarkets(
  source: Observable<System | null>
): Observable<Map<number, CurrencyMarket>> {
  return source.pipe(
    mergeMap((system) => {
      if (system) {
        return forkJoin(
          system
            .getTradableCurrencies()
            .map(({ id, assetSymbol, underlyingSymbol }) =>
              of({
                id,
                symbol: assetSymbol,
                underlyingSymbol,
                markets: new Map(
                  system
                    .getMarkets(id)
                    .map((market) => [market.marketKey, market])
                ),
                orderedMarkets: system.getMarkets(id),
              } as CurrencyMarket)
            )
        );
      }
      return of([] as CurrencyMarket[]);
    }),
    map((markets) => {
      return new Map(markets.map((market) => [market.id, market]));
    })
  );
}

function areMarketsEqual(
  prev: Map<number, CurrencyMarket>,
  curr: Map<number, CurrencyMarket>
) {
  const prevKeys = [...prev.keys()];
  const currKeys = [...curr.keys()];

  if (prevKeys.length !== currKeys.length) {
    return false;
  }

  return [...curr.entries()].every(([key, market]) => {
    const prevMarkets = prev?.get(key)?.markets ?? new Map<string, Market>();
    const prevMarketKeys = [...prevMarkets.keys()];
    const currMarketKeys = [...market.markets.keys()];

    if (prevMarketKeys.length !== currMarketKeys.length) {
      return false;
    }

    return [...market.markets.entries()].every(
      ([marketKey, m]) => prevMarkets.get(marketKey)?.hashKey === m.hashKey
    );
  });
}

marketUpdates$.subscribe({
  next: (currencyMarkets) => {
    updateMarketState({ currencyMarkets });
  },
  complete: () => {
    console.log('market updates complete');
  },
});
