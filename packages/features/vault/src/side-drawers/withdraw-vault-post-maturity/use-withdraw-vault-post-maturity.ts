import { useContext } from 'react';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import {
  TradePropertyKeys,
  TransactionData,
} from '@notional-finance/trade';



export function useWithdrawVaultPostMaturity() {
  const { state } = useContext(VaultActionContext);
  const { buildTransactionCall, amountToWallet } = state;

  let transactionData: TransactionData | undefined;
  let transactionProperties;

  if(amountToWallet && buildTransactionCall) {
    transactionProperties = {
      [TradePropertyKeys.amountToWallet]: amountToWallet
    };

    transactionData = {
      transactionHeader: '',
      buildTransactionCall, 
      transactionProperties,
    };
  }
  return transactionData
}
