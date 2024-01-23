import { useEffect } from 'react';
import {
  TradeState,
  TradeType,
  createTradeManager,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import {
  createObservableContext,
  useObservableContext,
} from './ObservableContext';

export function createTradeContext(displayName: string) {
  return createObservableContext<TradeState>(
    displayName,
    initialBaseTradeState as TradeState
  );
}

export function useTradeContext(tradeType: TradeType) {
  const { updateState, state$, state } = useObservableContext<TradeState>(
    initialBaseTradeState as TradeState,
    createTradeManager
  );

  useEffect(() => {
    updateState({
      tradeType,
      // Change the default setting for leveraged lend
      // customizeLeverage: tradeType === 'LeveragedLend',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { updateState, state$, state };
}
