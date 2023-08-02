import {
  BehaviorSubject,
  Subject,
  scan,
  shareReplay,
  distinctUntilKeyChanged,
  map,
  Observable,
} from 'rxjs';

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


