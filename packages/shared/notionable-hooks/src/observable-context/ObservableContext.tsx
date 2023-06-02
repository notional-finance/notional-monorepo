import { GlobalState } from '@notional-finance/notionable';
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { EMPTY, Observable, scan, switchMap, tap } from 'rxjs';
import { QueryParamConfigMap, useQueryParams } from 'use-query-params';
import { useNotionalContext } from '../notional/use-notional';

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
  queryParamConfig: QueryParamConfigMap,
  loadManagers: (
    state$: Observable<T>,
    global$: Observable<GlobalState>
  ) => Observable<Partial<T>> = () => EMPTY as Observable<Partial<T>>
) {
  const params = useParams<Record<string, string>>();
  const { pathname } = useLocation();
  const [query, setQuery] = useQueryParams(queryParamConfig);
  const { globalState$ } = useNotionalContext();

  // Creates an observable state object that can be updated
  const [updateState, state$] = useObservableCallback<
    T,
    Partial<T>,
    [Partial<T>]
  >(
    (state$) =>
      state$.pipe(
        scan((state, update) => ({ ...state, ...update }), initialState)
      ),
    // Transforms the list of args into a single arg which is Partial<T>
    (args) => args[0]
  );

  useSubscription(state$, (s) => {
    if (DEBUG) console.log('STATE', s);
  });
  const state = useObservableState(state$, initialState);

  // Loads managers and has them start listening to state. As each manager emits a value
  // it will be individually updated to state
  useSubscription(
    useObservable(
      (o$) => {
        return o$.pipe(
          switchMap(([s, g]) => loadManagers(s, g)),
          tap((s) => {
            if (DEBUG) console.log('CALCULATED UPDATE', s);
          })
        );
      },
      [state$, globalState$]
    ),
    updateState
  );

  useEffect(() => {
    // If any of the route params change then we will update state to initial and set the params,
    // this prevents any "residual" state from going between paths
    if (state.isReady) updateState(params as T);
    // NOTE: only run updates on pathname changes, since params is an object
    // it will always be marked as changed.
    // eslint-disable-next-line
  }, [pathname, state.isReady]);

  useEffect(() => {
    const updates = Object.keys(query).reduce((u, k) => {
      const stateVal = k in state ? state[k] : undefined;
      if (stateVal === undefined && query[k] !== undefined) {
        // If param is undefined in state, it has param has precedence
        return { ...u, [k]: query[k] };
      } else if (k in state && stateVal !== query[k]) {
        // If state is defined and doesn't match query, then update query
        // to match state
        setQuery({ [k]: stateVal });
      }

      return u;
    }, {} as Partial<T>);

    if (Object.keys(updates).length !== 0) {
      updateState(updates);
    }
  }, [query, state, updateState, setQuery]);

  return { updateState, state$, state };
}
