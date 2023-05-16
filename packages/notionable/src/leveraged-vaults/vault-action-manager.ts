import { requireKeysDefined, mapWithDistinctInputs } from '../utils';
import { system$ } from '../notional/notional-store';
import { account$ } from '../account/account-store';
import { activeVaultMarkets$ } from './vault-store';
import { combineLatest, merge, Observable, map, filter } from 'rxjs';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import {
  getInitVaultAction,
  getBorrowMarketData,
  getWithdrawAmountData,
  getDefaultLeverageRatio,
  getUpdatedVaultAccount,
} from './logic';
import { VaultActionState } from './vault-action-store';
import { getVaultCapacity } from './logic/get-vault-capacity';
import { vaultPerformance$ } from './vault-manager';

export const loadVaultActionManager = (
  state$: Observable<VaultActionState>
): Observable<Partial<VaultActionState>> => {
  const vaultAddress$ = state$.pipe(map((s) => s.vaultAddress));
  const defaultVaultAction$ = state$.pipe(map((s) => s.vaultAction || s['sideDrawerKey'])) as Observable<VAULT_ACTIONS>;

  // Returns initial vault action values, runs whenever the account or vault address
  // changes (for the most part)
  const onVaultChange$ = combineLatest({
    system: system$,
    account: account$,
    vaultAddress: vaultAddress$,
    defaultVaultAction: defaultVaultAction$,
    activeVaultMarkets: activeVaultMarkets$,
    vaultPerformance: vaultPerformance$,
  }).pipe(
    requireKeysDefined('system', 'vaultAddress'),
    mapWithDistinctInputs(
      getInitVaultAction,
      'vaultAddress',
      'defaultVaultAction',
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
    mapWithDistinctInputs(getDefaultLeverageRatio, 'vaultAction')
  );

  // Returns market data relevant to borrowing, only relevant for create account,
  // increase account and roll account actions. If not one of those actions then
  // will return empty values to clear that data from the store
  const onBorrowInputChange$ = state$.pipe(
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
  const onWithdrawInputChange$ = state$.pipe(
    requireKeysDefined('baseVault', 'vaultAccount', 'vaultAction'),
    mapWithDistinctInputs(
      getWithdrawAmountData,
      'vaultAction',
      'withdrawAmount',
      'maxWithdraw',
      'leverageRatio'
    )
  );

  const onEntryValuesChange$ = state$.pipe(
    requireKeysDefined('baseVault', 'vaultAccount'),
    mapWithDistinctInputs(
      getUpdatedVaultAccount,
      'accountAddress',
      'vaultAction',
      'depositAmount',
      'selectedMarketKey',
      'leverageRatio'
    )
  );

  // Returns net capacity change based on the action
  const onCapacityChange$ = state$.pipe(
    requireKeysDefined('vaultConfig'),
    mapWithDistinctInputs(
      getVaultCapacity,
      'vaultAction',
      'vaultAccount',
      // @note mapWithDistinctInputs has problems with circular dependencies, so
      // a direct dependency on fCashToLend or fCashToBorrow causes issues here
      'depositAmount',
      'leverageRatio',
      'selectedMarketKey',
      'withdrawAmount',
      'maxWithdraw'
    )
  );

  return merge(
    onVaultChange$,
    defaultLeverageRatio$,
    onBorrowInputChange$,
    onWithdrawInputChange$,
    onEntryValuesChange$,
    onCapacityChange$
  );
};
