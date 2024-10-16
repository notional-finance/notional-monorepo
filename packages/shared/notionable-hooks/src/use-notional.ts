import { pluckFirst, useObservable } from 'observable-hooks';
import { NotionalError } from '@notional-finance/notionable';
import { useCallback, useContext } from 'react';
import { NotionalContext } from './context/NotionalContext';
import { switchMap, take, concat } from 'rxjs';
import { Network } from '@notional-finance/util';
import { isAppReady } from '@notional-finance/notionable';
import {
  useAppStore,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';
import { getNetworkModel } from '@notional-finance/core-entities';

export function useAppReady() {
  const {
    appState: { networkState },
  } = useAppContext();
  const appStore = useAppStore();

  return isAppReady(networkState) && appStore.isAppReady;
}

export function useAnalyticsReady(network: Network | undefined) {
  const {
    // Active accounts is emitted when analytics are ready
    appState: { activeAccounts },
  } = useAppContext();
  return !!activeAccounts && !!network && !!activeAccounts[network];
}

export function useLastUpdateBlockNumber() {
  const currentNetworkStore = useCurrentNetworkStore();
  return currentNetworkStore.lastUpdatedBlock;
}

export function useAppContext() {
  const { app, app$, updateAppState } = useContext(NotionalContext);
  const initialState$ = useObservable(pluckFirst, [app]);

  // Ensures that listeners receive the initial global state
  const appState$ = useObservable(
    (s$) => concat(initialState$.pipe(take(1)), s$.pipe(switchMap(([g]) => g))),
    [app$]
  );

  return { appState: app, appState$, updateAppState };
}

export function useNotionalContext() {
  const { global, global$, updateGlobalState } = useContext(NotionalContext);
  const initialState$ = useObservable(pluckFirst, [global]);

  // Ensures that listeners receive the initial global state
  const _globalState$ = useObservable(
    (s$) => concat(initialState$.pipe(take(1)), s$.pipe(switchMap(([g]) => g))),
    [global$]
  );

  return {
    globalState: global,
    updateNotional: updateGlobalState,
    globalState$: _globalState$,
  };
}

export function useNOTE(network: Network | undefined) {
  return network
    ? getNetworkModel(network).getTokenBySymbol('NOTE')
    : undefined;
}

export function useNotionalError() {
  const appStore = useAppStore();

  const reportError = useCallback(
    (error: NotionalError) => {
      appStore.globalError.setGlobalError(error);
    },
    [appStore.globalError]
  );

  return {
    error: appStore.globalError.error,
    reportError,
  };
}
