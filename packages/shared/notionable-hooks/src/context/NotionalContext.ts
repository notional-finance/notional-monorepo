import {
  ApplicationState,
  GlobalState,
  initialApplicationState,
  initialGlobalState,
  loadAppManager,
  loadGlobalManager,
} from '@notional-finance/notionable';
import { useObservable, useSubscription } from 'observable-hooks';
import { EMPTY, Observable, switchMap, tap } from 'rxjs';
import { useObservableReducer } from './use-observable-reducer';
import React from 'react';

const DEBUG = process.env['NODE_ENV'] === 'development';

export const NotionalContext = React.createContext<{
  updateGlobalState: (args: Partial<GlobalState>) => void;
  global$: Observable<GlobalState>;
  global: GlobalState;
  updateAppState: (args: Partial<ApplicationState>) => void;
  app$: Observable<ApplicationState>;
  app: ApplicationState;
}>({
  updateGlobalState: () => {
    return;
  },
  global$: EMPTY,
  global: {} as GlobalState,
  updateAppState: () => {
    return;
  },
  app$: EMPTY,
  app: {} as ApplicationState,
});

export function useGlobalContext() {
  const {
    updateState: updateGlobalState,
    state$: global$,
    state: global,
  } = useObservableReducer(initialGlobalState, '[GLOBAL]');

  const {
    updateState: updateAppState,
    state$: app$,
    state: app,
  } = useObservableReducer(initialApplicationState, '[APP]');

  useSubscription(
    useObservable(
      (s$) =>
        s$.pipe(
          switchMap(([a]) => loadAppManager(a)),
          tap((s) => {
            if (DEBUG) console.log('[APP] UPDATE:', s);
          })
        ),
      [app$]
    ),
    updateAppState
  );

  // Loads managers and has them start listening to state. As each manager emits a value
  // it will be individually updated to state
  useSubscription(
    useObservable(
      (s$) =>
        s$.pipe(
          switchMap(([s]) => loadGlobalManager(s)),
          tap((s) => {
            if (DEBUG) console.log('[GLOBAL] UPDATE:', s);
          })
        ),
      [global$]
    ),
    updateGlobalState
  );

  return { updateGlobalState, updateAppState, app$, global$, app, global };
}
