import { filterEmpty } from '@notional-finance/util';
import { Observable, map, of, switchMap } from 'rxjs';
import { BaseTradeState } from '../base-trade/base-trade-store';
import { AccountDefinition } from '@notional-finance/core-entities';

export function selectedNetwork(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    map((s) => s.selectedNetwork),
    filterEmpty()
  );
}

export function selectedAccount(network$: ReturnType<typeof selectedNetwork>) {
  return network$.pipe(switchMap(() => of(null as AccountDefinition | null)));
}
