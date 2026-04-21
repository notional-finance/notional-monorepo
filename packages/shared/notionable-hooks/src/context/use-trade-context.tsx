import { AllTradeTypes, TradeModel } from '@notional-finance/notionable';
import { createContext, useEffect } from 'react';
import { useSelectedNetwork } from '../use-network';
import { useParams } from 'react-router-dom';
import { useObserver } from 'mobx-react-lite';
import { useRootStore } from './use-root-store';
import { Instance } from 'mobx-state-tree';
import { defineMessage, MessageDescriptor } from 'react-intl';
import { UTILIZATION_ERROR } from '@notional-finance/util';
export interface ObservableContext {
  tradeModel?: Instance<typeof TradeModel>;
}

export function createObservableContext(displayName: string) {
  const context = createContext<ObservableContext | undefined>(undefined);
  context.displayName = displayName;
  return context;
}

export function createTradeContext(displayName: string) {
  return createObservableContext(displayName);
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
      vaultAddress: params.vaultAddress?.toLowerCase(),
    });

    return () => {
      root.clearTradeModel();
    };
  }, [
    root,
    tradeType,
    network,
    params.vaultAddress,
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

export function useTradeErrorMessage(): MessageDescriptor | undefined {
  const context = useCurrentTradeContext();
  const inputsSatisfied = context?.inputsSatisfied;
  const calculationSuccess = context?.calculationSuccess;
  const calculateError = context?.calculateError;
  const { overPoolCapacityError } = context?.getVaultCapacity() || {};
  const inputErrors = context?.inputErrors;
  if (context?.tradeType === 'ManageVault') return undefined;

  if (!inputsSatisfied) {
    if (context?.tradeType === 'AdjustVaultLeverage') {
      return defineMessage({
        defaultMessage: 'Adjust Leverage to Continue',
      });
    } else {
      return defineMessage({
        defaultMessage: 'Enter Amount',
      });
    }
  } else if (overPoolCapacityError) {
    return defineMessage({
      defaultMessage: 'Over Max Liquidity Pool Share',
    });
  } else if (inputErrors) {
    return defineMessage({
      defaultMessage: 'Insufficient Balance',
    });
  } else if (
    !calculationSuccess &&
    inputsSatisfied &&
    calculateError === UTILIZATION_ERROR
  ) {
    return defineMessage({
      defaultMessage: 'Insufficient Borrow Liquidity',
    });
  } else if (!calculationSuccess && inputsSatisfied) {
    return defineMessage({
      defaultMessage: 'Error Calculating Trade',
    });
  }

  return undefined;
}
