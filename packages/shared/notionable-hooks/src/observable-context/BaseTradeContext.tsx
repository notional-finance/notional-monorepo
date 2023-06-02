import {
  BaseTradeState,
  createBaseTradeManager,
  initialBaseTradeState,
  TradeConfiguration,
  TradeType,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  useObservableContext,
} from './ObservableContext';

export function createBaseTradeContext(trade: TradeType) {
  return createObservableContext<BaseTradeState>(trade, initialBaseTradeState);
}

export function useBaseTradeContext(trade: TradeType) {
  return useObservableContext<BaseTradeState>(
    initialBaseTradeState,
    {},
    createBaseTradeManager(TradeConfiguration[trade])
  );
}
