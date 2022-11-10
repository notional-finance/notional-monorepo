import {
  account$,
  activeVaultMarkets$,
  requireKeysDefined,
  system$,
  mapWithDistinctInputs,
} from '@notional-finance/notionable';
import { combineLatest, merge, Observable, pluck } from 'rxjs';
import {
  getMinimumLeverageRatio,
  getUpdatedVaultAccount,
  getVaultAccountDefaults,
} from './logic/account-logic';
import { getInitVaultAction } from './logic/init-logic';
import { getMaturityData } from './logic/maturity-logic';
import { VaultActionState } from './vault-action-store';

export const loadVaultActionManager = (
  state$: Observable<VaultActionState>
): Observable<Partial<VaultActionState>> => {
  const vaultAddress$ = state$.pipe(pluck('vaultAddress'));

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

  const vaultMaturityData$ = state$.pipe(
    requireKeysDefined(
      'baseVault',
      'vaultAccount',
      'vaultAction',
      'eligibleMarkets',
      'leverageRatio'
    ),
    mapWithDistinctInputs(
      getMaturityData,
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
    vaultMaturityData$,
    updatedVaultAccount$,
    minimumLeverageRatio$,
    accountDefaults$
  );
};
