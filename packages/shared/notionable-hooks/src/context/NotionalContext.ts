import {
  GlobalState,
  initialGlobalState,
  // loadGlobalManager,
} from '@notional-finance/notionable';
// import { useObservable, useSubscription } from 'observable-hooks';
// import { EMPTY, switchMap, tap } from 'rxjs';
import { EMPTY } from 'rxjs';
import { useObservableReducer } from './use-observable-reducer';
import React from 'react';
import { ObservableContext } from './ObservableContext';

// const DEBUG = process.env['NODE_ENV'] === 'development';

// NOTE: this function is duplicated here because for some reason the test code
// does not import it properly
function createObservableContext<T>(
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

export const NotionalContext = createObservableContext<GlobalState>(
  'notional-global-context',
  initialGlobalState
);

export function useGlobalContext() {
  const { updateState, state$, state } = useObservableReducer(
    initialGlobalState,
    '[GLOBAL]'
  );

  // Loads managers and has them start listening to state. As each manager emits a value
  // it will be individually updated to state
  // useSubscription(
  //   useObservable(
  //     (s$) =>
  //       s$.pipe(
  //         switchMap(([s]) => loadGlobalManager(s)),
  //         tap((s) => {
  //           if (DEBUG) console.log('[GLOBAL] UPDATE:', s);
  //         })
  //       ),
  //     [state$]
  //   ),
  //   updateState
  // );

  return { updateState, state$, state };
}
