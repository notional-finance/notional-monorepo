import {
  BaseTradeState,
  TradeState,
  TradeType,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import { createObservableContext } from './ObservableContext';
import { useEffect } from 'react';
import { useSelectedNetwork } from '../use-network';
import { useRootStore } from '@notional-finance/notionable';
import { AllTradeTypes } from '@notional-finance/notionable';
import { useParams } from 'react-router-dom';
import { useObserver } from 'mobx-react-lite';

export function createTradeContext(displayName: string) {
  return createObservableContext<TradeState>(
    displayName,
    initialBaseTradeState as TradeState
  );
}

const defaultUpdateState = (_state: Partial<BaseTradeState>) => {
  return;
};

const useTradeModel = (tradeType: AllTradeTypes) => {
  const network = useSelectedNetwork();
  const root = useRootStore();
  const params = useParams<{
    selectedDepositToken?: string;
    selectedToken?: string;
  }>();

  useEffect(() => {
    // NOTE: this is intended to reset the trade model on every network change
    if (network) {
      root.setTradeModel({
        tradeType,
        selectedNetwork: network,
        selectedDepositToken: params.selectedDepositToken,
        selectedToken: params.selectedToken,
      });
    }

    return () => {
      root.clearTradeModel();
    };
  }, [tradeType, network, params.selectedDepositToken, params.selectedToken]);

  return useObserver(() => root.tradeModel);
};

export function useTradeContext(tradeType: TradeType) {
  const tradeModel = useTradeModel(tradeType);
  const state = useObserver(() => {
    if (tradeModel) {
      return tradeModel.state as unknown as BaseTradeState;
    } else {
      return initialBaseTradeState;
    }
  });

  return {
    updateState: defaultUpdateState,
    state,
    actions: tradeModel?.actions,
  };
}

export function useCurrentTradeContext() {
  const root = useRootStore();
  return useObserver(() => root.tradeModel);
}
