import { TypedBigNumber } from '@notional-finance/sdk';
import { useObservable, useObservableState } from 'observable-hooks';
import {
  initializeNotional,
  initialNotionalState,
  notionalState$,
  chains,
} from '@notional-finance/notionable';
import { useContext } from 'react';
import { NotionalContext } from './NotionalContext';
import { switchMap, startWith } from 'rxjs';

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
  const { system } = useNotional();
  return system?.lastUpdateBlockNumber;
}

export function useCurrentETHPrice() {
  const { system } = useNotional();
  return system
    ? `$${TypedBigNumber.fromBalance(1e8, 'ETH', true)
        .toCUR('USD')
        .toDisplayString(2)}`
    : undefined;
}

export function useNotionalContext() {
  const { state, state$, updateState } = useContext(NotionalContext);

  // Ensures that only listeners receive the initial global state
  const globalState$ = useObservable(
    (o$) => o$.pipe(switchMap(([g]) => g.pipe(startWith(state)))),
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
