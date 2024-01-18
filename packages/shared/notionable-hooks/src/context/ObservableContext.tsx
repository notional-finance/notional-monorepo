import { useObservable, useSubscription } from 'observable-hooks';
import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { EMPTY, Observable, switchMap, tap, of } from 'rxjs';
import { useAppReady } from '../use-notional';
import { useObservableReducer } from './use-observable-reducer';

const DEBUG = process.env['NODE_ENV'] === 'development';

export interface ObservableContext<T> {
  updateState: (args: Partial<T>) => void;
  state$: Observable<T>;
  state: T;
}

export function createObservableContext<T>(
  displayName: string,
  initialState: T,
  defaultValue = {
    updateState: () => {
      return;
    },
    state$: EMPTY,
  }
) {
  const context = React.createContext<ObservableContext<T>>({
    ...defaultValue,
    state: initialState,
  });
  context.displayName = displayName;
  return context;
}

interface ContextState extends Record<string, unknown> {
  isReady: boolean;
}

export function useObservableContext<T extends ContextState>(
  initialState: T,
  loadManagers: (state$: Observable<T>) => Observable<Partial<T>> = () =>
    EMPTY as Observable<Partial<T>>
) {
  const params = useParams<Record<string, string>>();
  const { pathname } = useLocation();
  const isAppReady = useAppReady();
  const { updateState, state$, state } = useObservableReducer(
    initialState,
    '[STATE]'
  );

  // Loads managers and has them start listening to state. As each manager emits a value
  // it will be individually updated to state
  useSubscription(
    useObservable(
      (o$) => {
        return o$.pipe(
          switchMap(([s, load, appReady]) => (appReady ? load(s) : of({}))),
          tap((s) => {
            if (DEBUG) console.log('CALCULATED UPDATE', s);
          })
        );
      },
      [state$, loadManagers, isAppReady]
    ),
    updateState
  );

  useEffect(() => {
    // If any of the route params change then we will update state to initial and set the params,
    // this prevents any "residual" state from going between paths. Use isNetworkReady here to
    // prevent race conditions based on when dependencies update.
    if (isAppReady) {
      if (DEBUG) console.log('URL UPDATE', params);
      updateState(params as T);
    }
    // NOTE: only run updates on pathname changes, since params is an object
  }, [pathname, isAppReady, updateState, params]);

  return { updateState, state$, state };
}
