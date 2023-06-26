import {
  VaultTradeState,
  createVaultTradeManager,
  initialBaseTradeState,
  VaultTradeType,
} from '@notional-finance/notionable';
import {
  ObservableContext,
  createObservableContext,
  useObservableContext,
} from './ObservableContext';
import { useEffect } from 'react';
import { useQueryParams } from 'use-query-params';

export type VaultContext = React.Context<ObservableContext<VaultTradeState>>;

export function createVaultContext(trade: VaultTradeType) {
  return createObservableContext<VaultTradeState>(trade, initialBaseTradeState);
}

export function useVaultContext() {
  const [query, setQuery] = useQueryParams({
    confirm: {
      encode: (v) => (v === 'true' ? 'true' : null),
      decode: (v) => v === 'true',
    },
  });

  const { updateState, state$, state } = useObservableContext<VaultTradeState>(
    initialBaseTradeState,
    {},
    createVaultTradeManager
  );
  const canSubmit = state.canSubmit;

  useEffect(() => {
    if (query['confirm'] && canSubmit) {
      updateState({ confirm: query['confirm'] });
    } else if (query['confirm']) {
      // Clears the confirm parameter if we cannot submit
      setQuery({ confirm: false });
    }
  }, [updateState, query, canSubmit, setQuery]);

  return { updateState, state$, state };
}
