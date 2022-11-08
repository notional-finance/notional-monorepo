import Notional from '@notional-finance/sdk';
import { System } from '@notional-finance/sdk/src/system';
import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  map,
  Observable,
  scan,
  shareReplay,
  Subject,
} from 'rxjs';

export interface NotionalState {
  notional: Notional | null;
  loaded: boolean;
  // This is the currently connected chain
  connectedChain: number;
  // This is the chain that notional will be connected to next
  pendingChainId: number;
}
export type NotionalStateKeys = keyof NotionalState;

export const initialNotionalState: NotionalState = {
  notional: null,
  loaded: false,
  connectedChain: -1,
  pendingChainId: -1,
};

const _notionalStore = new BehaviorSubject(initialNotionalState);
const _updateSubject = new Subject<Partial<NotionalState>>();

_updateSubject
  .pipe(
    scan((state, update) => ({ ...state, ...update }), initialNotionalState)
  )
  .subscribe(_notionalStore);

export const notionalState$ = _notionalStore
  .asObservable()
  .pipe(shareReplay(1));
export function updateNotionalState(update: Partial<NotionalState>) {
  _updateSubject.next(update);
}

export function selectNotionalState(key: NotionalStateKeys) {
  return notionalState$.pipe(
    distinctUntilKeyChanged(key),
    map((state) => state[key])
  );
}

export const notional$ = selectNotionalState(
  'notional'
) as Observable<Notional | null>;
export const system$ = notional$.pipe(
  map((notional: Notional | null) => notional?.system ?? null)
) as Observable<System | null>;
