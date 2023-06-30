import {
  pluckFirst,
  useObservable,
  useObservableState,
} from 'observable-hooks';
import {
  initializeNotional,
  initialNotionalState,
  notionalState$,
  chains,
} from '@notional-finance/notionable';
import { useContext } from 'react';
import { NotionalContext } from './context/NotionalContext';
import { switchMap, take, concat } from 'rxjs';
import { Registry, TokenBalance } from '@notional-finance/core-entities';

// Deprecate this....
export function useNotional() {
  const { notional, loaded, connectedChain, pendingChainId } =
    useObservableState(notionalState$, initialNotionalState);

  function getConnectedChain() {
    return chains.find((chain) => parseInt(chain.id) === connectedChain);
  }

  return {
    notional,
    system: notional?.system ?? null,
    connectedChain,
    loaded,
    pendingChainId,
    initializeNotional,
    getConnectedChain,
  };
}

export function useLastUpdateBlockNumber() {
  const network = useSelectedNetwork();
  return network
    ? Registry.getOracleRegistry().getLastUpdateBlock(network)
    : undefined;
}

export function useCurrentETHPrice() {
  const network = useSelectedNetwork();
  if (network) {
    const eth = TokenBalance.unit(
      Registry.getTokenRegistry().getTokenBySymbol(network, 'ETH')
    );
    const usdc = Registry.getTokenRegistry().getTokenBySymbol(network, 'USDC');
    return eth.toToken(usdc).toDisplayString(2);
  }

  return undefined;
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
