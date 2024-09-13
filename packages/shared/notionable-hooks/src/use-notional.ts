import {
  pluckFirst,
  useObservable,
  useObservableState,
} from 'observable-hooks';
import { NotionalError } from '@notional-finance/notionable';
import { useCallback, useContext } from 'react';
import { NotionalContext } from './context/NotionalContext';
import { switchMap, take, concat, map, filter } from 'rxjs';
import { NOTERegistryClient, Registry } from '@notional-finance/core-entities';
import { Network, getDefaultNetworkFromHostname } from '@notional-finance/util';
import { isAppReady } from '@notional-finance/notionable';
import { useWalletConnectedNetwork } from './use-wallet';
import { useAppStore } from '@notional-finance/notionable';

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
  const network =
    useWalletConnectedNetwork() ||
    getDefaultNetworkFromHostname(window.location.hostname);
  return network
    ? Registry.getOracleRegistry().getLastUpdateBlock(network)
    : undefined;
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
    ? Registry.getTokenRegistry().getTokenBySymbol(network, 'NOTE')
    : undefined;
}

export function useStakedNOTEPoolReady() {
  return (
    useObservableState(
      Registry.getOracleRegistry()
        .subscribeNetworkKeys(Network.mainnet)
        .pipe(
          filter((s) => s?.key === NOTERegistryClient.sNOTEOracle),
          map(() => true)
        )
    ) ||
    Registry.getOracleRegistry().isKeyRegistered(
      Network.mainnet,
      NOTERegistryClient.sNOTEOracle
    )
  );
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
