import { filterEmpty } from '@notional-finance/util';
import { map, Observable, pairwise } from 'rxjs';
import { GlobalState } from './global-state';

export function resetOnNetworkChange<T>(
  global$: Observable<GlobalState>,
  initialState: T
) {
  return global$.pipe(
    filterEmpty(),
    pairwise(),
    map(([prev, cur]) => {
      if (prev.selectedNetwork !== cur.selectedNetwork) {
        return initialState;
      } else {
        return undefined;
      }
    }),
    filterEmpty()
  );
}

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
      g.isAccountReady && g.selectedAccount ? g.selectedAccount : undefined
    ),
    filterEmpty()
  );
}
