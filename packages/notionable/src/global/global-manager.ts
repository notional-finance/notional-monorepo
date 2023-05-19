import { Network } from '@notional-finance/util';
import { Observable, merge, pairwise, filter, switchMap } from 'rxjs';
import { GlobalState } from './global-state';
import { onSelectedNetworkChange } from './logic';

export const loadGlobalManager = (
  state$: Observable<GlobalState>
): Observable<Partial<GlobalState>> => {
  const onSelectedNetworkChange$ = state$.pipe(
    pairwise(),
    filter(([_, cur]) => cur.selectedNetwork !== undefined),
    switchMap(([prev, cur]) => {
      return onSelectedNetworkChange(
        cur.cacheHostname,
        cur.selectedNetwork as Network,
        prev.selectedNetwork
      );
    })
  );

  return merge(onSelectedNetworkChange$);
};
