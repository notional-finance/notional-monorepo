import {
  pluckFirst,
  useObservable,
  useObservableState,
} from 'observable-hooks';
import { NotionalError } from '@notional-finance/notionable';
import { useCallback, useContext, useMemo } from 'react';
import { NotionalContext } from './context/NotionalContext';
import { switchMap, take, concat, map, filter } from 'rxjs';
import { NOTERegistryClient, Registry } from '@notional-finance/core-entities';
import { Network, getDefaultNetworkFromHostname } from '@notional-finance/util';
import { isAppReady } from '@notional-finance/notionable';
import { useWalletConnectedNetwork } from './use-wallet';

export function useAppReady() {
  const {
    globalState: { networkState },
  } = useNotionalContext();
  return isAppReady(networkState);
}

export function useAnalyticsReady(network: Network | undefined) {
  const {
    // Active accounts is emitted when analytics are ready
    globalState: { activeAccounts },
  } = useNotionalContext();
  return !!activeAccounts && !!network && !!activeAccounts[network];
}

export function useHeroStats() {
  const {
    globalState: { heroStats, activeAccounts },
  } = useNotionalContext();

  return useMemo(() => ({ heroStats, activeAccounts }), [heroStats, activeAccounts]);
}

export function useLastUpdateBlockNumber() {
  const network =
    useWalletConnectedNetwork() ||
    getDefaultNetworkFromHostname(window.location.hostname);
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
