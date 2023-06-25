import {
  GlobalState,
  initialGlobalState,
  loadGlobalManager,
} from '@notional-finance/notionable';
import { useObservable, useSubscription } from 'observable-hooks';
import { switchMap, tap } from 'rxjs';
import { createObservableContext } from '../observable-context/ObservableContext';
import { useObservableReducer } from '../observable-context/use-observable-reducer';

const DEBUG = process.env['NODE_ENV'] === 'development';

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
  useSubscription(
    useObservable(
      (s$) =>
        s$.pipe(
          switchMap(([s]) => loadGlobalManager(s)),
          tap((s) => {
            if (DEBUG) console.log('[GLOBAL] UPDATE:', s);
          })
        ),
      [state$]
    ),
    updateState
  );

  return { updateState, state$, state };
}
