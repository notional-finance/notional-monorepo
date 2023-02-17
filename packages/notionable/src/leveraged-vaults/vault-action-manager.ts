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
  getVaultAccountDefaults,
} from './logic/account-logic';
import { getInitVaultAction } from './logic/get-init-vault-action';
import { getBorrowMarketData } from './logic/get-borrow-market-data';
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

  const accountDefaults$ = state$.pipe(
    requireKeysDefined(
      'baseVault',
      'vaultAccount',
      'vaultConfig',
      'eligibleMarkets',
      'eligibleActions'
    ),
    mapWithDistinctInputs(
      getVaultAccountDefaults,
      'vaultAction',
      'vaultAccount',
      'eligibleMarkets',
      'eligibleActions'
    )
  );

  return merge(
    initVaultAction$,
    borrowMarketData$,
    updatedVaultAccount$,
    minimumLeverageRatio$,
    accountDefaults$
  );
};
