import { Registry } from '@notional-finance/core-entities';
import { filterEmpty } from '@notional-finance/util';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { BaseTradeState } from '../base-trade/base-trade-store';

export function selectedNetwork(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    map((s) => s.selectedNetwork),
    filterEmpty()
  );
}

export function selectedAccount(network$: ReturnType<typeof selectedNetwork>) {
  return combineLatest([
    Registry.getAccountRegistry().activeAccount$,
    network$,
  ]).pipe(
    switchMap(([account, network]) =>
      account && network
        ? Registry.getAccountRegistry().subscribeAccount(network, account)
        : of(null)
    )
  );
}
