import {
  TradeState,
  createTradeManager,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  ObservableContext,
  useObservableContext,
} from './ObservableContext';

export type TradeContext = React.Context<ObservableContext<TradeState>>;

export function createTradeContext() {
  return createObservableContext<TradeState>(
    'trade-context',
    initialBaseTradeState
  );
}

export function useTradeContext() {
  const { updateState, state$, state } = useObservableContext<TradeState>(
    initialBaseTradeState,
    createTradeManager
  );

  return { updateState, state$, state };
}
