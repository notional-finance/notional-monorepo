import {
  BaseTradeState,
  createBaseTradeManager,
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

export type BaseTradeContext = React.Context<ObservableContext<BaseTradeState>>;

export function createBaseTradeContext(trade: TradeType) {
  return createObservableContext<BaseTradeState>(trade, initialBaseTradeState);
}

export function useBaseTradeContext(trade: TradeType) {
  const [query, setQuery] = useQueryParams({
    confirm: {
      encode: (v) => (v === 'true' ? 'true' : null),
      decode: (v) => v === 'true',
    },
  });

  const baseTradeManager = useMemo(() => {
    return createBaseTradeManager(TradeConfiguration[trade]);
  }, [trade]);

  const { updateState, state$, state } = useObservableContext<BaseTradeState>(
    initialBaseTradeState,
    {},
    baseTradeManager
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
