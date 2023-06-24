import {
  TradeState,
  createTradeManager,
  initialBaseTradeState,
  TradeConfiguration,
  TradeType,
} from '@notional-finance/notionable';
import { useEffect, useMemo } from 'react';
import { useQueryParams } from 'use-query-params';
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
  const [query, setQuery] = useQueryParams({
    confirm: {
      encode: (v) => (v === 'true' ? 'true' : null),
      decode: (v) => v === 'true',
    },
  });

  const tradeManager = useMemo(() => {
    return createTradeManager(TradeConfiguration[trade]);
  }, [trade]);

  const { updateState, state$, state } = useObservableContext<TradeState>(
    initialBaseTradeState,
    {},
    tradeManager
  );
  const canSubmit = state.canSubmit;

  useEffect(() => {
    if (query['confirm'] && canSubmit) {
      updateState({ confirm: query['confirm'] });
    } else if (query['confirm']) {
      // Clears the confirm parameter if we cannot submit
      setQuery({ confirm: false });
    }
  }, [updateState, query, canSubmit, setQuery]);

  return { updateState, state$, state };
}
