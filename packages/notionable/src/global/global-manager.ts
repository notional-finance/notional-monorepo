import { Observable, merge } from 'rxjs';
import { GlobalState } from './global-state';
import { onAppLoad } from './sagas/on-app-load';

export const loadGlobalManager = (
  global$: Observable<GlobalState>
): Observable<Partial<GlobalState>> => {
  /***
   * onAppLoad =>
   *    - check geoip and vpn status
   *    - registry initializes to all supported networks
   *    - listen for onNetworkPending for each supported network and mark them as ready
   *
   * onWalletConnect =>
   *    - move holdings groups into account registry
   *    - account registry needs to handle multiple networks
   *    - account registry should use wallet provider if accessible
   *    - set portfolio network to the wallet network by default
   *    - checks community NFTs
   *
   * onTransaction =>
   *    - pending pnl should move to a per network basis
   */

  return merge(onAppLoad(global$));
};
