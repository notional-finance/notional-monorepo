import { TypedBigNumber } from '@notional-finance/sdk-v2';
import { useObservableState } from 'observable-hooks';
import { initialNotionalState, notionalState$ } from './notional-store';
import { initializeNotional } from './notional-manager';
import { chains } from '../chains';

export function useNotional() {
  const { notional, loaded, connectedChain } = useObservableState(
    notionalState$,
    initialNotionalState
  );

  function getConnectedChain() {
    return chains.find((chain) => parseInt(chain.id) === connectedChain);
  }

  return {
    notional,
    system: notional?.system ?? null,
    connectedChain,
    loaded,
    initializeNotional,
    getConnectedChain,
  };
}

export function useContracts() {
  const { notional } = useNotional();
  return notional?.contracts;
}

export function useLastUpdateBlockNumber() {
  const { system } = useNotional();
  return system?.lastUpdateBlockNumber;
}

export function useCurrentETHPrice() {
  const { system } = useNotional();
  return system
    ? `$${TypedBigNumber.fromBalance(1e8, 'ETH', true).toCUR('USD').toDisplayString(2)}`
    : undefined;
}
