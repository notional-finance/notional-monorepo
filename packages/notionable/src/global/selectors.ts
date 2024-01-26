import { Registry } from '@notional-finance/core-entities';
import { filterEmpty } from '@notional-finance/util';
import { Observable, map, of, startWith, switchMap } from 'rxjs';
import { BaseTradeState } from '../base-trade/base-trade-store';

export function selectedNetwork(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    map((s) => s.selectedNetwork),
    filterEmpty()
  );
}

export function selectedAccount(network$: ReturnType<typeof selectedNetwork>) {
  return network$.pipe(
    switchMap((network) =>
      network
        ? Registry.getAccountRegistry().subscribeActiveAccount(network)
        : of(null)
    ),
    startWith(null)
  );
}
