import { requireKeysDefined, mapWithDistinctInputs } from '../utils';
import { system$ } from '../notional/notional-store';
import { account$ } from '../account/account-store';
import { activeVaultMarkets$ } from './vault-store';
import { combineLatest, merge, Observable, map, filter } from 'rxjs';
import {
  getInitVaultAction,
  getBorrowMarketData,
  getWithdrawAmountData,
  getDefaultLeverageRatio,
  getUpdatedVaultAccount,
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

  // Sets the valid leverage ratio range based on inputs
  const defaultLeverageRatio$ = state$.pipe(
    requireKeysDefined(
      'baseVault',
      'vaultAccount',
      'vaultConfig',
      'vaultAction'
    ),
    filter((s) => s['leverageRatio'] === undefined),
    mapWithDistinctInputs(
      getDefaultLeverageRatio,
      'vaultAction',
      'leverageRatio'
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
    requireKeysDefined('baseVault', 'vaultAccount'),
    mapWithDistinctInputs(
      getUpdatedVaultAccount,
      'vaultAction',
      'depositAmount',
      'selectedMarketKey'
    )
  );

  return merge(
    initVaultAction$,
    defaultLeverageRatio$,
    borrowMarketData$,
    withdrawAmountData$,
    updatedVaultAccount$
  );
};
