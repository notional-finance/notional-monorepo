import { BehaviorSubject, distinctUntilKeyChanged, map, scan, shareReplay, Subject } from 'rxjs';
import { CurrencyMarket } from '../types';

export interface MarketState {
  currencyMarkets: Map<number, CurrencyMarket>;
}
export type MarketStateKeys = keyof MarketState;

export const initialMarketState: MarketState = {
  currencyMarkets: new Map<number, CurrencyMarket>(),
};

const _store = new BehaviorSubject(initialMarketState);
const _updateSubject = new Subject<Partial<MarketState>>();

_updateSubject
  .pipe(scan((state, update) => ({ ...state, ...update }), initialMarketState))
  .subscribe(_store);

export const marketState$ = _store.asObservable().pipe(shareReplay(1));

export function updateMarketState(update: Partial<MarketState>) {
  _updateSubject.next(update);
}

export function selectMarketState(key: MarketStateKeys) {
  return marketState$.pipe(
    distinctUntilKeyChanged(key),
    map((state) => state[key])
  );
}

export const currencyMarkets$ = selectMarketState('currencyMarkets');
