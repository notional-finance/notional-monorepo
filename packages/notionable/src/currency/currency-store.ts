import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  map,
  Observable,
  scan,
  shareReplay,
  Subject,
} from 'rxjs';
import { Currency } from '@notional-finance/sdk-v2';
import { ERC20Token } from '../types';

export interface CurrencyState {
  currencies: Map<number, Currency>;
  tradableCurrencies: Map<number, Currency>;
  tokens: Map<string, ERC20Token>;
  systemTokens: Map<string, ERC20Token>;
}
export type CurrencyStateKeys = keyof CurrencyState;

export const initialCurrencyState: CurrencyState = {
  currencies: new Map(),
  tradableCurrencies: new Map(),
  tokens: new Map(),
  systemTokens: new Map(),
};

const _currencyStore = new BehaviorSubject(initialCurrencyState);
const _updateSubject = new Subject<Partial<CurrencyState>>();

_updateSubject
  .pipe(
    scan((state, update) => ({ ...state, ...update }), initialCurrencyState)
  )
  .subscribe(_currencyStore);

export const currencyState$ = _currencyStore
  .asObservable()
  .pipe(shareReplay(1));

export function updateCurrencyState(update: Partial<CurrencyState>) {
  _updateSubject.next(update);
}

export function selectCurrencyState(key: CurrencyStateKeys) {
  return currencyState$.pipe(
    distinctUntilKeyChanged(key),
    map((state) => state[key])
  );
}

export const tokens$ = selectCurrencyState('tokens') as Observable<
  Map<string, ERC20Token>
>;
export const currencies$ = selectCurrencyState('currencies') as Observable<
  Map<number, Currency>
>;
export const tradableCurrencies$ = selectCurrencyState(
  'tradableCurrencies'
) as Observable<Map<number, Currency>>;
