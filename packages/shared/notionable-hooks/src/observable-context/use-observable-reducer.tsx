import {
  useObservable,
  pluckFirst,
  useObservableCallback,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import { concat, take, withLatestFrom, scan } from 'rxjs';

const DEBUG = true; // process.env['NODE_ENV'] === 'development';

export function useObservableReducer<T>(initialState: T, logPrefix?: string) {
  // Converts the initial state into an observable to make it safe in
  // a closure
  const initialState$ = useObservable(pluckFirst, [initialState]);

  // Creates an observable state object that can be updated
  const [updateState, state$] = useObservableCallback<
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
            (state, [update, init]) => ({ ...init, ...state, ...update }),
            {} as T
          )
        )
      ),
    // Transforms the list of args into a single arg which is Partial<T>
    (args) => args[0]
  );

  const state = useObservableState(state$, initialState);
  useSubscription(state$, (s) => {
    if (DEBUG) console.log(`${logPrefix} STATE`, s);
  });

  return { updateState, state$, state };
}
