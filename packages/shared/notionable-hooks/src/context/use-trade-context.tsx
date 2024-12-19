import {
  TradeState,
  AllTradeTypes,
  initialBaseTradeState,
} from '@notional-finance/notionable';
import { createObservableContext } from './ObservableContext';
import { useEffect } from 'react';
import { useSelectedNetwork } from '../use-network';
import { useParams } from 'react-router-dom';
import { useObserver } from 'mobx-react-lite';
import { useRootStore } from './use-root-store';

export function createTradeContext(displayName: string) {
  return createObservableContext<TradeState>(
    displayName,
    initialBaseTradeState as TradeState
  );
}

const useTradeModel = (tradeType: AllTradeTypes) => {
  const network = useSelectedNetwork();
  const root = useRootStore();
  const params = useParams<{
    selectedDepositToken?: string;
    selectedToken?: string;
    vaultAddress?: string;
  }>();

  useEffect(() => {
    // NOTE: this is intended to reset the trade model on every network change
    root.setTradeModel({
      tradeType,
      selectedNetwork: network,
      selectedDepositToken: params.selectedDepositToken,
      selectedToken: params.selectedToken,
      vaultAddress: params.vaultAddress,
    });

    return () => {
      root.clearTradeModel();
    };
  }, [
    root,
    tradeType,
    network,
    params.selectedDepositToken,
    params.selectedToken,
  ]);

  return useObserver(() => root.tradeModel);
};

export function useTradeContext(tradeType: AllTradeTypes) {
  const tradeModel = useTradeModel(tradeType);

  return {
    tradeModel,
  };
}

export function useCurrentTradeContext() {
  const root = useRootStore();
  return useObserver(() => root.tradeModel);
}
