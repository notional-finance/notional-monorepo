import { Observable, merge } from 'rxjs';
import { GlobalState } from './global-state';
import { onAppLoad } from './sagas/on-app-load';
import { onWalletConnect } from './sagas/on-wallet-connect';

export const loadGlobalManager = (
  global$: Observable<GlobalState>
): Observable<Partial<GlobalState>> => {
  /***
   * onTransaction =>
   *    - pending pnl should move to a per network basis
   */

  return merge(onAppLoad(global$), onWalletConnect(global$));
};
