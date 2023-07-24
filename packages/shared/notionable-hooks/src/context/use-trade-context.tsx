import { useEffect } from 'react';
import {
  TradeState,
  TradeType,
  createTradeManager,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  ObservableContext,
  useObservableContext,
} from './ObservableContext';

export type TradeContext = React.Context<ObservableContext<TradeState>>;

export function createTradeContext(displayName: string) {
  return createObservableContext<TradeState>(displayName, initialBaseTradeState);
}

export function useTradeContext(tradeType: TradeType) {
  const { updateState, state$, state } = useObservableContext<TradeState>(
    initialBaseTradeState,
    createTradeManager
  );

  useEffect(() => {
    updateState({ tradeType });
  }, [updateState, tradeType]);

  return { updateState, state$, state };
}
