import {
  VaultTradeState,
  createVaultTradeManager,
  initialVaultTradeState,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  useObservableContext,
} from './ObservableContext';

export function createVaultContext() {
  return createObservableContext<VaultTradeState>(
    'vault-context',
    initialVaultTradeState
  );
}

export function useVaultContext() {
  const { updateState, state$, state } = useObservableContext<VaultTradeState>(
    initialVaultTradeState,
    createVaultTradeManager
  );

  return { updateState, state$, state };
}
