import { Account, TradeHistory } from '@notional-finance/sdk-v2';
import {
  from,
  timer,
  of,
  Observable,
  forkJoin,
  Subject,
  combineLatest,
  switchMap,
  mergeMap,
  tap,
  catchError,
  takeUntil,
  exhaustMap,
  map,
  merge,
  withLatestFrom,
  finalize,
  distinctUntilChanged,
  filter,
} from 'rxjs';

import { signer$ as onboardSigner$ } from '../onboard/onboard-store';
import { BalanceSummary, AssetSummary } from '@notional-finance/sdk-v2/account';
import Notional from '@notional-finance/sdk-v2';
import { notional$ } from '../notional/notional-store';
import {
  account$,
  updateAccountState,
  AccountState,
  initialAccountState,
  isReadOnly$,
} from './account-store';
import { AssetSummaryResult, BalanceSummaryResult, SummaryUpdateResult } from '../types';
import { AccountRefreshInterval } from '../notionable.config';

const _startRefresh = new Subject();
const startRefresh$ = _startRefresh.asObservable();
const _stopRefresh = new Subject();
const stopRefresh$ = _stopRefresh.asObservable();
const _voidSigner = new Subject<string>();
const voidSigner$ = _voidSigner.asObservable();

const _defaultBalanceSummaryResult: BalanceSummaryResult = {
  balanceSummary: [] as BalanceSummary[],
  noteSummary: null,
};

const _defaultAssetSummaryResult: AssetSummaryResult = {
  assetSummary: [] as AssetSummary[],
  tradeHistory: [] as TradeHistory[],
};

export function setReadOnlyAddress(readOnlyAddress: string) {
  _voidSigner.next(readOnlyAddress);
}

const _signer$ = merge(onboardSigner$, voidSigner$).pipe(
  withLatestFrom(isReadOnly$),
  map(([signer, isReadOnly]) => {
    if (typeof signer === 'string') {
      _stopRefresh.next(true);
      updateAccountState({ ...initialAccountState, isReadOnly: true, readOnlyAddress: signer });
    } else if (typeof signer === 'object' && signer !== null) {
      _stopRefresh.next(true);
      updateAccountState({ ...initialAccountState, readOnlyAddress: undefined, isReadOnly: false });
    } else if (signer === null && !isReadOnly) {
      _stopRefresh.next(true);
      updateAccountState({ ...initialAccountState, readOnlyAddress: undefined, isReadOnly: false });
    }
    return signer;
  })
);

const _accountUpdates = new Subject<Account>();
const accountUpdates$ = _accountUpdates.asObservable().pipe(
  distinctUntilChanged((a, b) => {
    if (a && b) {
      const aHash = a.accountData?.hashKey ?? '';
      const bHash = b.accountData?.hashKey ?? '';
      const areIdentical = aHash === bHash;
      /* console.log(`Prev Hash: ${aHash}`);
      console.log(`New Hash: ${bHash}`); */
      console.log(`Accounts are identical: ${areIdentical}`);
      return areIdentical;
    }
    console.log(`accounts are different`);
    return false;
  }),
  mergeMap((account) => {
    if (account && account !== null) {
      return forkJoin({
        balance: from(account.getBalanceSummary()),
        asset: from(account.getAssetSummary()),
      });
    }
    return of({
      balance: _defaultBalanceSummaryResult,
      asset: _defaultAssetSummaryResult,
    } as SummaryUpdateResult);
  }),
  switchMap(({ asset, balance }) => {
    const assetSummary = new Map(asset.assetSummary?.map((item) => [item.assetKey, item]) ?? []);
    const balanceSummary = new Map(
      balance.balanceSummary?.map((item) => [item.currencyId, item]) ?? []
    );
    const noteSummary = balance.noteSummary;
    return of({ assetSummary, balanceSummary, noteSummary });
  }),
  catchError((err) => {
    console.error(err);
    return of(err);
  })
);

const _accountRefresh$ = account$.pipe(
  switchMap((account) => {
    if (account && account !== null) {
      return from(account.refreshAccountData()).pipe(map(() => account));
    }
    return of(account);
  }),
  filter((account) => account !== null),
  map((account) => _accountUpdates.next(account!))
);

// Streams
const _accountRefreshTimer$ = timer(0, AccountRefreshInterval).pipe(
  switchMap(() => _accountRefresh$),
  takeUntil(stopRefresh$),
  finalize(() => console.log('account refresh timer completed'))
);

const signerOrNotionalChanged$: Observable<Account | null> = combineLatest({
  signer: _signer$,
  notional: notional$,
}).pipe(
  switchMap(({ signer, notional }) => {
    if (signer && signer !== null && notional && notional !== null) {
      return from((notional as Notional).getAccount(signer));
    }
    return of(null);
  }),
  catchError((err) => {
    console.error(err);
    return of(err);
  })
);

startRefresh$
  .pipe(
    tap((address) => console.log(`start account refresh: ${address}`)),
    exhaustMap(() => _accountRefreshTimer$)
  )
  .subscribe();

signerOrNotionalChanged$.subscribe((account) => {
  if (account && account !== null) {
    updateAccountState({ account, accountConnected: !!account });
    _startRefresh.next(account.address);
  }
});

accountUpdates$.subscribe({
  next: (result: Partial<AccountState>) => {
    console.log('updating account summaries');
    updateAccountState(result);
  },
  complete: () => console.log('account updates completed'),
});
