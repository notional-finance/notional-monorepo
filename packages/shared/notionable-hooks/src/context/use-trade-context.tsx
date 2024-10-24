import {
  BaseTradeState,
  TradeState,
  TradeType,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import { createObservableContext } from './ObservableContext';
import { useTradeModel } from '../trade/use-trade-model';
import { getSnapshot } from 'mobx-state-tree';

export function createTradeContext(displayName: string) {
  return createObservableContext<TradeState>(
    displayName,
    initialBaseTradeState as TradeState
  );
}

const defaultUpdateState = (_state: Partial<BaseTradeState>) => {
  return;
};

export function useTradeContext(tradeType: TradeType) {
  const tradeModel = useTradeModel(tradeType);
  const state: BaseTradeState = tradeModel
    ? (getSnapshot(tradeModel) as unknown as BaseTradeState) ||
      initialBaseTradeState
    : initialBaseTradeState;

  return { updateState: defaultUpdateState, state };
}
