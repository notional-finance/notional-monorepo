import {
  VaultTradeState,
  createVaultTradeManager,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  useObservableContext,
} from './ObservableContext';

export function createVaultContext() {
  return createObservableContext<VaultTradeState>(
    'vault-context',
    initialBaseTradeState
  );
}

export function useVaultContext() {
  const { updateState, state$, state } = useObservableContext<VaultTradeState>(
    initialBaseTradeState,
    createVaultTradeManager
  );

  return { updateState, state$, state };
}
