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
    initialBaseTradeState as VaultTradeState
  );
}

export function useVaultContext() {
  const { updateState, state$, state } = useObservableContext<VaultTradeState>(
    initialBaseTradeState as VaultTradeState,
    createVaultTradeManager
  );

  return { updateState, state$, state };
}
