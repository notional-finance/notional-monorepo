import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  map,
  Observable,
  scan,
  shareReplay,
  Subject,
} from 'rxjs';
import { TokenBalance } from '../types';

export interface WalletState {
  tokens: Map<string, TokenBalance>;
  walletConnected: boolean;
}
export type WalletStateKeys = keyof WalletState;

export const initialWalletState: WalletState = {
  tokens: new Map(),
  walletConnected: false,
};

const _walletStore = new BehaviorSubject(initialWalletState);
const _updateSubject = new Subject<Partial<WalletState>>();

_updateSubject
  .pipe(scan((state, update) => ({ ...state, ...update }), initialWalletState))
  .subscribe(_walletStore);

export const walletState$ = _walletStore.asObservable().pipe(shareReplay(1));

export function updateWalletState(update: Partial<WalletState>) {
  _updateSubject.next(update);
}

export function selectWalletState(key: WalletStateKeys) {
  return walletState$.pipe(
    distinctUntilKeyChanged(key),
    map((state) => state[key])
  );
}

export const tokenBalances$ = selectWalletState('tokens') as Observable<Map<string, TokenBalance>>;
export const walletConnected$ = selectWalletState('walletConnected') as Observable<boolean>;
