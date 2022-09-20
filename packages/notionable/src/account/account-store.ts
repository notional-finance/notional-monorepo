import { Account } from '@notional-finance/sdk-v2';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  scan,
  Subject,
} from 'rxjs';
import {
  BalanceSummary,
  AssetSummary,
  NOTESummary,
} from '@notional-finance/sdk-v2/account';
import { Hashable } from '../types';

export interface AccountState {
  isReadOnly: boolean;
  readOnlyAddress?: string;
  account: Account | null;
  balanceSummary: Map<number, BalanceSummary>;
  assetSummary: Map<string, AssetSummary>;
  noteSummary: NOTESummary | null;
  accountConnected: boolean;
}
export type AccountStateKeys = keyof AccountState;

export const initialAccountState: AccountState = {
  account: null,
  isReadOnly: false,
  balanceSummary: new Map(),
  assetSummary: new Map(),
  noteSummary: null,
  accountConnected: false,
};

const _accountStore = new BehaviorSubject(initialAccountState);
const _updateSubject = new Subject<Partial<AccountState>>();

_updateSubject
  .pipe(scan((state, update) => ({ ...state, ...update }), initialAccountState))
  .subscribe(_accountStore);

export const accountState$ = _accountStore.asObservable().pipe();

export function updateAccountState(update: Partial<AccountState>) {
  _updateSubject.next(update);
}

function compareHashMaps<T>(prev: Map<T, Hashable>, curr: Map<T, Hashable>) {
  return (
    prev.size === curr.size &&
    Array.from(prev.keys()).every((key: T) => {
      if (prev.has(key) && curr.has(key)) {
        return compareHashKey(
          prev.get(key) as Hashable,
          curr.get(key) as Hashable
        );
      }
      return false;
    })
  );
}

function compareHashKey(prev: Hashable, curr: Hashable) {
  return prev.hashKey === curr.hashKey;
}

export function selectAccountState(key: AccountStateKeys) {
  return accountState$.pipe(
    distinctUntilChanged((a, b) => {
      switch (key) {
        case 'balanceSummary':
          return compareHashMaps<number>(a[key], b[key]);
        case 'assetSummary':
          return compareHashMaps<string>(a[key], b[key]);
        case 'account':
          return (
            a[key] !== null &&
            b[key] !== null &&
            !!a[key]!.accountData &&
            !!b[key]!.accountData &&
            compareHashKey(a[key]!.accountData!, b[key]!.accountData!)
          );
        case 'noteSummary':
          return (
            a[key] !== null &&
            b[key] !== null &&
            compareHashKey(a[key]!, b[key]!)
          );
        default:
          return a[key] !== null && b[key] !== null && a[key] === b[key];
      }
    }),
    map((state) => state[key])
  );
}

export const account$ = selectAccountState(
  'account'
) as Observable<Account | null>;
export const balanceSummary$ = selectAccountState(
  'balanceSummary'
) as Observable<Map<number, BalanceSummary>>;
export const assetSummary$ = selectAccountState('assetSummary') as Observable<
  Map<string, AssetSummary>
>;
export const noteSummary$ = selectAccountState(
  'noteSummary'
) as Observable<NOTESummary | null>;
export const accountConnected$ = selectAccountState(
  'accountConnected'
) as Observable<boolean>;
export const isReadOnly$ = selectAccountState(
  'isReadOnly'
) as Observable<boolean>;
export const readOnlyAddress$ = selectAccountState(
  'readOnlyAddress'
) as Observable<string | undefined>;
