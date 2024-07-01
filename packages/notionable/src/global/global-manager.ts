import { Observable, merge } from 'rxjs';
import { ApplicationState, GlobalState } from './global-state';
import { onAppLoad } from './sagas/on-app-load';
import { onWalletConnect } from './sagas/on-wallet-connect';
import { onTransact } from './sagas/on-transact';
import { onDataUpdate } from './sagas/on-data-update';

export const loadGlobalManager = (
  global$: Observable<GlobalState>,
  app$: Observable<ApplicationState>
): Observable<Partial<GlobalState>> => {
  return merge(onTransact(global$), onWalletConnect(global$, app$));
};

export const loadAppManager = (
  app$: Observable<ApplicationState>
): Observable<Partial<ApplicationState>> => {
  return merge(onDataUpdate(app$), onAppLoad(app$));
};
