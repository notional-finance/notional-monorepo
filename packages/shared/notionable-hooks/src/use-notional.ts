import { pluckFirst, useObservable } from 'observable-hooks';
import { NotionalError } from '@notional-finance/notionable';
import { useCallback, useContext } from 'react';
import { NotionalContext } from './context/NotionalContext';
import { switchMap, take, concat } from 'rxjs';
import { Registry } from '@notional-finance/core-entities';

export function useLastUpdateBlockNumber() {
  const network = useSelectedNetwork();
  return network
    ? Registry.getOracleRegistry().getLastUpdateBlock(network)
    : undefined;
}

export function useNotionalContext() {
  const { state, state$, updateState } = useContext(NotionalContext);
  const initialState$ = useObservable(pluckFirst, [state]);

  // Ensures that listeners receive the initial global state
  const globalState$ = useObservable(
    (s$) => concat(initialState$.pipe(take(1)), s$.pipe(switchMap(([g]) => g))),
    [state$]
  );

  return { globalState: state, updateNotional: updateState, globalState$ };
}

export function useSelectedNetwork() {
  const {
    globalState: { selectedNetwork, isNetworkReady },
  } = useNotionalContext();

  return isNetworkReady ? selectedNetwork : undefined;
}

export function useNotionalError() {
  const {
    globalState: { error },
    updateNotional,
  } = useNotionalContext();

  const reportError = useCallback(
    (error: NotionalError) => {
      updateNotional({ error });
    },
    [updateNotional]
  );

  return {
    error,
    reportError,
  };
}
