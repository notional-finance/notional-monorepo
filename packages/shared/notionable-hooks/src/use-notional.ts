import { pluckFirst, useObservable } from 'observable-hooks';
import { NotionalError } from '@notional-finance/notionable';
import { useCallback, useContext } from 'react';
import { NotionalContext } from './context/NotionalContext';
import { switchMap, take, concat } from 'rxjs';
import { Registry } from '@notional-finance/core-entities';
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

export function useStakedNOTE() {
  return Registry.getTokenRegistry().getTokenBySymbol(Network.mainnet, 'sNOTE');
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
