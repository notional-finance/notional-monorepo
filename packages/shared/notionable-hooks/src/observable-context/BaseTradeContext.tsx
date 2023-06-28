import {
  TradeState,
  createTradeManager,
  initialBaseTradeState,
  TradeConfiguration,
  TradeType,
} from '@notional-finance/notionable';
import { useMemo } from 'react';
import {
  createObservableContext,
  ObservableContext,
  useObservableContext,
} from './ObservableContext';

export type TradeContext = React.Context<ObservableContext<TradeState>>;

export function createTradeContext(trade: TradeType) {
  return createObservableContext<TradeState>(trade, initialBaseTradeState);
}

export function useTradeContext(trade: TradeType) {
  const tradeManager = useMemo(() => {
    return createTradeManager(TradeConfiguration[trade]);
  }, [trade]);

  const { updateState, state$, state } = useObservableContext<TradeState>(
    initialBaseTradeState,
    tradeManager
  );

  return { updateState, state$, state };
}
