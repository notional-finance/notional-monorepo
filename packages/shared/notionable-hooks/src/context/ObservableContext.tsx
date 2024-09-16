import { useObservable, useSubscription } from 'observable-hooks';
import React from 'react';
import { useLocation, useParams } from 'react-router';
import {
  EMPTY,
  Observable,
  switchMap,
  tap,
  of,
  map,
  filter,
  distinctUntilChanged,
  observeOn,
  asyncScheduler,
} from 'rxjs';
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
          switchMap(([s, load, appReady]) =>
            appReady
              ? load(s).pipe(
                  observeOn(asyncScheduler),
                  tap((s) => {
                    if (DEBUG) console.log('CALCULATED UPDATE', s);
                  })
                )
              : of({})
          )
        );
      },
      [state$, loadManagers, isAppReady]
    ),
    updateState
  );

  // Listens to route changes and updates the state on path changes
  useSubscription(
    useObservable(
      (o$) => {
        return o$.pipe(
          filter(([ready]) => ready),
          distinctUntilChanged(
            ([, oldPath], [, newPath]) => oldPath === newPath
          ),
          map(
            ([, pathname, params]) =>
              // On path change we reset the trade state
              ({ reset: true, pathname, ...params } as unknown as Partial<T>)
          ),
          tap((p) => {
            if (DEBUG) console.log('URL UPDATE', p);
          })
        );
      },
      [isAppReady, pathname, params]
    ),
    updateState
  );

  return { updateState, state$, state };
}
