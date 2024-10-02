import {
  useObservable,
  pluckFirst,
  useObservableCallback,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import { useCallback, useTransition } from 'react';
import { concat, take, withLatestFrom, scan } from 'rxjs';

const DEBUG = process.env['NODE_ENV'] === 'development';

interface Resettable extends Record<string, unknown> {
  reset?: boolean;
}

export function useObservableReducer<T extends Resettable>(
  initialState: T,
  logPrefix?: string
) {
  // Converts the initial state into an observable to make it safe in
  // a closure
  const initialState$ = useObservable(pluckFirst, [initialState]);
  const [isPending, startTransition] = useTransition();

  // Creates an observable state object that can be updated
  const [_updateState, state$] = useObservableCallback<
    T,
    Partial<T>,
    [Partial<T>]
  >(
    (state$) =>
      // Uses concat here to ensure that the initial state emitted is
      // also closure safe
      concat(
        initialState$.pipe(take(1)),
        state$.pipe(
          withLatestFrom(initialState$),
          scan(
            (state, [update, init]) =>
              // If the flag "reset" is seen then reset the state to the initial state
              update.reset === true
                ? { ...init, tradeType: state['tradeType'], ...update }
                : { ...init, ...state, ...update },
            {} as T
          )
        )
      ),
    // Transforms the list of args into a single arg which is Partial<T>
    (args) => args[0]
  );

  const updateState = useCallback(
    (update: Partial<T>) => {
      startTransition(() => {
        _updateState(update);
      });
    },
    [_updateState, startTransition]
  );

  const state = useObservableState(state$, initialState);
  useSubscription(state$, (s) => {
    if (DEBUG) console.info(`${logPrefix} STATE`, s);
  });

  return { updateState, state$, state, isPending };
}
