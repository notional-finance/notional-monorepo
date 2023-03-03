import { useContext } from 'react';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import {
  TradePropertyKeys,
  TransactionData,
} from '@notional-finance/trade';



export function useWithdrawVault() {
  const { state } = useContext(VaultActionContext);
  const { buildTransactionCall, updatedVaultAccount, amountToWallet, vaultAccount, baseVault, withdrawAmount, leverageRatio } = state;
  const isFullRepayment = vaultAccount?.primaryBorrowfCash.isZero() || false;

  let transactionData: TransactionData | undefined;
  let transactionProperties;

    if(vaultAccount && baseVault && buildTransactionCall && updatedVaultAccount) {
      transactionProperties = {
        [TradePropertyKeys.amountToWallet]: isFullRepayment
          ? amountToWallet
          : withdrawAmount,
        [TradePropertyKeys.leverageRatio]: leverageRatio,
        [TradePropertyKeys.remainingDebt]: updatedVaultAccount
          ? updatedVaultAccount.primaryBorrowfCash.neg()
          : vaultAccount.primaryBorrowfCash.neg(),
        [TradePropertyKeys.remainingAssets]: updatedVaultAccount
          ? baseVault.getCashValueOfShares(updatedVaultAccount).toUnderlying()
          : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
        [TradePropertyKeys.transactionCosts]: undefined,
      };

    transactionData = {
      transactionHeader: '',
      buildTransactionCall, 
      transactionProperties,
    };
}


  return transactionData
}
