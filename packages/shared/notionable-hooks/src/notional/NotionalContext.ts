import {
  GlobalState,
  initialGlobalState,
  loadGlobalManager,
} from '@notional-finance/notionable';
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import { scan, switchMap } from 'rxjs';
import { createObservableContext } from '../observable-context/ObservableContext';

const DEBUG = process.env['NODE_ENV'] === 'development';

export const NotionalContext = createObservableContext<GlobalState>(
  'notional-global-context',
  initialGlobalState
);

export function useGlobalContext() {
  // Creates an observable state object that can be updated
  const [updateState, state$] = useObservableCallback<
    GlobalState,
    Partial<GlobalState>,
    [Partial<GlobalState>]
  >(
    (state$) =>
      state$.pipe(
        scan((state, update) => {
          if (DEBUG) console.log('[GLOBAL] update:', update, 'state: ', state);
          return { ...state, ...update };
        }, initialGlobalState)
      ),
    // Transforms the list of args into a single arg which is Partial<T>
    (args) => args[0]
  );
  const state = useObservableState(state$, initialGlobalState);

  // Loads managers and has them start listening to state. As each manager emits a value
  // it will be individually updated to state
  useSubscription(
    useObservable(
      (s$) => s$.pipe(switchMap(([s]) => loadGlobalManager(s))),
      [state$]
    ),
    updateState
  );

  return { updateState, state$, state };
}
