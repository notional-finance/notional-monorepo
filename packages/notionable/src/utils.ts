import {
  BehaviorSubject,
  Subject,
  scan,
  shareReplay,
  distinctUntilKeyChanged,
  map,
  filter,
  OperatorFunction,
  Observable,
  merge,
  distinctUntilChanged,
  pipe,
} from 'rxjs';
import { Hashable } from './types';

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

export type RequiredKeys<T, K extends keyof T> =
  // Omit leaves behind all the non-K types on T
  // The second part of the & rewrites the K keys in T
  Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

export function requireKeysDefined<T, K extends keyof T>(...keys: K[]) {
  return filter((obj: T) => {
    return !keys.map((k) => !!obj[k]).some((b) => b === false);
    // NOTE: this unknown conversion is required because Typescript does not
    // properly parse RequiredKeys as equivalent to T (which it is)
  }) as unknown as OperatorFunction<T, RequiredKeys<T, typeof keys[number]>>;
}

// Converts an object of observables to emitting partial state updates for a store
export function mergeEmitKeys<T>(observables: {
  [P in keyof T]?: Observable<T[P]>;
}) {
  const keys = Object.keys(observables) as [keyof T];
  const keyedObservables = keys
    .map((k) => {
      return observables[k]?.pipe(
        map((v) => {
          return { [k]: v };
        })
      );
    })
    .filter((o) => o !== undefined);

  return merge(...(keyedObservables as NonNullable<typeof keyedObservables>));
}

function isHashable(o: any): o is Hashable {
  return !!o && typeof o === 'object' && 'hashKey' in o;
}

function compareWithHashable(prev: any, cur: any) {
  if (isHashable(prev) && isHashable(cur)) {
    return prev.hashKey === cur.hashKey;
  } else {
    return Object.is(prev, cur);
  }
}

export function requireValueChange<T, K extends keyof T>(...keys: K[]) {
  return distinctUntilChanged<T>((prev, cur) => {
    // Returns true if every key defined returns true via compareWithHashable
    return keys.map((k) => compareWithHashable(prev[k], cur[k])).every(Boolean);
  });
}

export function mapWithDistinctInputs<
  Params,
  ReturnVal,
  DistinctKeys extends keyof Params
>(f: (d: Params) => ReturnVal, ...keys: DistinctKeys[]) {
  return pipe(requireValueChange<Params, DistinctKeys>(...keys), map(f));
}
