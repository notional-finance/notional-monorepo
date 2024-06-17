import {
  NOTETradeState,
  createNOTEManager,
  initialNOTETradeState,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  useObservableContext,
} from './ObservableContext';

export function createNOTEContext() {
  return createObservableContext<NOTETradeState>(
    'NOTEContext',
    initialNOTETradeState as NOTETradeState
  );
}

export function useNOTEContext() {
  const { updateState, state$, state } = useObservableContext<NOTETradeState>(
    initialNOTETradeState,
    createNOTEManager
  );

  return { updateState, state$, state };
}
