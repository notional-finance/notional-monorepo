import {
  BehaviorSubject,
  Subject,
  scan,
  shareReplay,
  distinctUntilKeyChanged,
  map,
  Observable,
} from 'rxjs';
import { BaseTradeState } from './base-trade/base-trade-store';
import { TokenDefinition } from '@notional-finance/core-entities';
import { RiskFactorKeys, RiskFactorLimit } from '@notional-finance/risk-engine';

export function makeStore<StateType>(initialState: StateType) {
  const _store = new BehaviorSubject(initialState);
  const _updateSubject = new Subject<Partial<StateType>>();

  _updateSubject
    .pipe(scan((state, update) => ({ ...state, ...update }), initialState))
    .subscribe(_store);

  const updateState = (update: Partial<StateType>) => {
    _updateSubject.next(update);
  };

  const _state$ = _store.asObservable().pipe(shareReplay(1));
  type StateKeys = keyof StateType;

  const selectState = <K extends StateKeys>(
    key: K
  ): Observable<StateType[K]> => {
    return _state$.pipe(
      distinctUntilKeyChanged(key),
      map((state) => state[key])
    );
  };

  return { _store, _updateSubject, updateState, selectState, _state$ };
}

export function isHashable(o: unknown): o is { hashKey: string } {
  return !!o && typeof o === 'object' && 'hashKey' in o;
}

export function getComparisonKey(
  arg: keyof BaseTradeState,
  s: Partial<BaseTradeState>
) {
  const val = s[arg];
  if (val === undefined) {
    return undefined;
  } else if (isHashable(val)) {
    return val.hashKey;
  } else if (arg === 'collateral' || arg === 'debt' || arg === 'deposit') {
    return (val as TokenDefinition).id;
  } else if (arg === 'riskFactorLimit') {
    const risk = val as RiskFactorLimit<RiskFactorKeys>;
    return `${risk?.riskFactor}:${
      isHashable(risk?.limit) ? risk?.limit.hashKey : risk?.limit.toString()
    }:${risk?.args?.map((t) => (typeof t === 'number' ? t : t?.id)).join(':')}`;
  } else {
    return val;
  }
}
