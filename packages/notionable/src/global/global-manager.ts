import { Observable, merge } from 'rxjs';
import { ApplicationState, GlobalState } from './global-state';
import { onAppLoad } from './sagas/on-app-load';
import { onTransact } from './sagas/on-transact';

export const loadGlobalManager = (
  global$: Observable<GlobalState>
): Observable<Partial<GlobalState>> => {
  return merge(onTransact(global$));
};

export const loadAppManager = (
  app$: Observable<ApplicationState>
): Observable<Partial<ApplicationState>> => {
  return merge(onAppLoad(app$));
};
