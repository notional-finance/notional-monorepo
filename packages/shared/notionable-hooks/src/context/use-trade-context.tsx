import {
  BaseTradeState,
  TradeState,
  TradeType,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import { createObservableContext } from './ObservableContext';
import { getSnapshot } from 'mobx-state-tree';
import { useEffect } from 'react';
import { useSelectedNetwork } from '../use-network';
import { useRootStore } from '@notional-finance/notionable';
import { AllTradeTypes } from '@notional-finance/notionable';
import { useParams } from 'react-router-dom';

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
  }, [tradeType, network, params.selectedDepositToken, params.selectedToken]);

  return root.tradeModel;
};

export function useTradeContext(tradeType: TradeType) {
  const tradeModel = useTradeModel(tradeType);
  const state: BaseTradeState = tradeModel
    ? (getSnapshot(tradeModel) as unknown as BaseTradeState) ||
      initialBaseTradeState
    : initialBaseTradeState;

  return { updateState: defaultUpdateState, state };
}
