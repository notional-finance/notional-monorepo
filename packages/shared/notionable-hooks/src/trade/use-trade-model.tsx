import { useEffect } from 'react';
import { useSelectedNetwork } from '../use-network';
import { useRootStore } from '@notional-finance/notionable';
import { AllTradeTypes } from '@notional-finance/notionable';
import { useParams } from 'react-router-dom';

export const useTradeModel = (tradeType: AllTradeTypes) => {
  const network = useSelectedNetwork();
  const root = useRootStore();
  const params = useParams<{
    selectedDepositToken?: string;
    selectedToken?: string;
  }>();

  useEffect(() => {
    root.setTradeModel({
      tradeType,
      selectedDepositToken: params.selectedDepositToken,
      selectedToken: params.selectedToken,
    });
  }, [tradeType, network, params.selectedDepositToken, params.selectedToken]);

  return root.tradeModel;
};
