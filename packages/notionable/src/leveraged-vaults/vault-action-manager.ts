import {
  account$,
  activeVaultMarkets$,
  requireKeysDefined,
  system$,
  mapWithDistinctInputs,
} from '..';
import { combineLatest, merge, Observable, map } from 'rxjs';
import {
  getMinimumLeverageRatio,
  getUpdatedVaultAccount,
} from './logic/account-logic';
import {
  getInitVaultAction,
  getBorrowMarketData,
  getWithdrawAmountData,
} from './logic';
import { VaultActionState } from './vault-action-store';

export const loadVaultActionManager = (
  state$: Observable<VaultActionState>
): Observable<Partial<VaultActionState>> => {
  const vaultAddress$ = state$.pipe(map((s) => s.vaultAddress));

  // Returns initial vault action values, runs whenever the account or vault address
  // changes (for the most part)
  const initVaultAction$ = combineLatest({
    system: system$,
    account: account$,
    vaultAddress: vaultAddress$,
    activeVaultMarkets: activeVaultMarkets$,
  }).pipe(
    requireKeysDefined('system', 'vaultAddress'),
    mapWithDistinctInputs(
      getInitVaultAction,
      'vaultAddress',
      'account',
      'system',
      'activeVaultMarkets'
    )
  );

  // Returns market data relevant to borrowing, only relevant for create account,
  // increase account and roll account actions. If not one of those actions then
  // will return empty values to clear that data from the store
  const borrowMarketData$ = state$.pipe(
    requireKeysDefined(
      'baseVault',
      'vaultAccount',
      'vaultAction',
      'eligibleMarkets',
      'leverageRatio'
    ),
    mapWithDistinctInputs(
      getBorrowMarketData,
      'vaultAction',
      'depositAmount',
      'leverageRatio',
      'selectedMarketKey'
    )
  );

  // Returns withdraw amounts and the corresponding updated vault account during
  // withdraw and repay debt actions
  const withdrawAmountData$ = state$.pipe(
    requireKeysDefined('baseVault', 'vaultAccount', 'vaultAction'),
    mapWithDistinctInputs(
      getWithdrawAmountData,
      'vaultAction',
      'withdrawAmount',
      'maxWithdraw',
      'leverageRatio'
    )
  );

  const updatedVaultAccount$ = state$.pipe(
    requireKeysDefined('baseVault', 'vaultAccount', 'selectedMarketKey'),
    mapWithDistinctInputs(
      getUpdatedVaultAccount,
      'vaultAction',
      'depositAmount',
      'selectedMarketKey',
      'fCashBorrowAmount'
    )
  );

  const minimumLeverageRatio$ = state$.pipe(
    requireKeysDefined('baseVault', 'vaultAccount', 'vaultConfig'),
    mapWithDistinctInputs(
      getMinimumLeverageRatio,
      'vaultAction',
      'depositAmount',
      'selectedMarketKey'
    )
  );

  // const accountDefaults$ = state$.pipe(
  //   requireKeysDefined(
  //     'baseVault',
  //     'vaultAccount',
  //     'vaultConfig',
  //     'eligibleMarkets',
  //     'eligibleActions'
  //   ),
  //   mapWithDistinctInputs(
  //     getVaultAccountDefaults,
  //     'vaultAction',
  //     'vaultAccount',
  //     'eligibleMarkets',
  //     'eligibleActions'
  //   )
  // );

  return merge(
    initVaultAction$,
    borrowMarketData$,
    withdrawAmountData$,
    updatedVaultAccount$,
    minimumLeverageRatio$
    // accountDefaults$
  );
};
