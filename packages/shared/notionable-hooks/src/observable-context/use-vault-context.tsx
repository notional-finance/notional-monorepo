import {
  BaseTradeState,
  VaultTradeState,
  createVaultTradeManager,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import {
  ObservableContext,
  createObservableContext,
  useObservableContext,
} from './ObservableContext';

export type BaseContext = React.Context<ObservableContext<BaseTradeState>>;
export type VaultContext = React.Context<ObservableContext<VaultTradeState>>;

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
