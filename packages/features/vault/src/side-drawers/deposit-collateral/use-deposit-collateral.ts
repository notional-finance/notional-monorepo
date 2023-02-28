import { TradeProperties, TradePropertyKeys, TransactionData } from '@notional-finance/trade';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { useContext } from 'react';


export function useDepositCollateral() {
    const { state: { 
      vaultAccount,
      buildTransactionCall,
      updatedVaultAccount,
      baseVault,
    } } = useContext(VaultActionContext);

  let transactionProperties: TradeProperties = {};
  if (vaultAccount && baseVault) {
    transactionProperties = {
      [TradePropertyKeys.remainingDebt]: updatedVaultAccount
        ? updatedVaultAccount.primaryBorrowfCash.neg()
        : vaultAccount.primaryBorrowfCash.neg(),
      [TradePropertyKeys.remainingAssets]: updatedVaultAccount
        ? baseVault.getCashValueOfShares(updatedVaultAccount).toUnderlying()
        : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
      [TradePropertyKeys.leverageRatio]: updatedVaultAccount 
        ? baseVault?.getLeverageRatio(updatedVaultAccount)
        : baseVault?.getLeverageRatio(vaultAccount),
    };
  }

  let transactionData: TransactionData | undefined;
  if(buildTransactionCall) {
    transactionData = {
      transactionHeader: '',
      transactionProperties,
      buildTransactionCall,
    };
  }

  return transactionData;
}
