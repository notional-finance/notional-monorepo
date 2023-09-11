import { Registry } from '@notional-finance/core-entities';
import { filterEmpty } from '@notional-finance/util';
import {
  Observable,
  map,
  distinctUntilChanged,
  switchMap,
  startWith,
} from 'rxjs';
import { GlobalState } from './global-state';

export function selectedNetwork(global$: Observable<GlobalState>) {
  return global$.pipe(
    map((g) =>
      g.isNetworkReady && g.selectedNetwork ? g.selectedNetwork : undefined
    ),
    filterEmpty()
  );
}

export function selectedAccount(global$: Observable<GlobalState>) {
  return global$.pipe(
    map((g) =>
      g.isAccountReady &&
      g.selectedAccount &&
      g.isNetworkReady &&
      g.selectedNetwork
        ? {
            selectedNetwork: g.selectedNetwork,
            selectedAccount: g.selectedAccount,
          }
        : undefined
    ),
    filterEmpty(),
    distinctUntilChanged(
      (prev, cur) =>
        prev.selectedNetwork === cur.selectedNetwork &&
        prev.selectedAccount === cur.selectedAccount
    ),
    switchMap(({ selectedNetwork, selectedAccount }) =>
      Registry.getAccountRegistry().subscribeAccount(
        selectedNetwork,
        selectedAccount
      )
    ),
    startWith(null)
  );
}
