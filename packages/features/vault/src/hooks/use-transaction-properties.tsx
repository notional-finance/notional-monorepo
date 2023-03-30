import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import {
  TradeProperties,
  TradePropertyKeys,
  TransactionData,
} from '@notional-finance/trade';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';
import { VaultActionContext } from '../vault-view/vault-action-provider';

export function useTransactionProperties(): TransactionData | undefined {
  const {
    state: {
      vaultAccount,
      buildTransactionCall,
      updatedVaultAccount,
      baseVault,
      vaultAction,
      depositAmount,
      amountToWallet,
      transactionCosts,
    },
  } = useContext(VaultActionContext);

  // Check that all dependencies are defined
  if (!(buildTransactionCall && vaultAction && vaultAccount && baseVault))
    return undefined;

  const transactionHeader = (
    <FormattedMessage {...messages[vaultAction].heading} />
  );

  let transactionProperties: TradeProperties;
  switch (vaultAction) {
    case VAULT_ACTIONS.CREATE_VAULT_POSITION:
    case VAULT_ACTIONS.INCREASE_POSITION:
    case VAULT_ACTIONS.ROLL_POSITION:
      transactionProperties = {
        [TradePropertyKeys.maturity]: updatedVaultAccount?.maturity,
        [TradePropertyKeys.additionalDebt]: updatedVaultAccount
          ? updatedVaultAccount.primaryBorrowfCash.neg()
          : vaultAccount.primaryBorrowfCash.neg(),
        [TradePropertyKeys.totalAssets]: updatedVaultAccount
          ? baseVault.getCashValueOfShares(updatedVaultAccount).toUnderlying()
          : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
        [TradePropertyKeys.leverageRatio]: updatedVaultAccount
          ? baseVault?.getLeverageRatio(updatedVaultAccount)
          : baseVault?.getLeverageRatio(vaultAccount),
        [TradePropertyKeys.transactionCosts]: transactionCosts,
      };
      break;
    case VAULT_ACTIONS.DEPOSIT_COLLATERAL:
      transactionProperties = {
        [TradePropertyKeys.deposit]: depositAmount,
        [TradePropertyKeys.leverageRatio]: updatedVaultAccount
          ? baseVault?.getLeverageRatio(updatedVaultAccount)
          : baseVault?.getLeverageRatio(vaultAccount),
        [TradePropertyKeys.transactionCosts]: transactionCosts,
      };
      break;
    case VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT:
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
        [TradePropertyKeys.transactionCosts]: transactionCosts,
      };
      break;
    case VAULT_ACTIONS.WITHDRAW_VAULT:
      transactionProperties = {
        [TradePropertyKeys.amountToWallet]: amountToWallet,
        [TradePropertyKeys.remainingDebt]: updatedVaultAccount
          ? updatedVaultAccount.primaryBorrowfCash.neg()
          : vaultAccount.primaryBorrowfCash.neg(),
        [TradePropertyKeys.remainingAssets]: updatedVaultAccount
          ? baseVault.getCashValueOfShares(updatedVaultAccount).toUnderlying()
          : baseVault.getCashValueOfShares(vaultAccount).toUnderlying(),
        [TradePropertyKeys.leverageRatio]: updatedVaultAccount
          ? baseVault?.getLeverageRatio(updatedVaultAccount)
          : baseVault?.getLeverageRatio(vaultAccount),
        [TradePropertyKeys.transactionCosts]: transactionCosts,
      };
      break;
    case VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY:
      transactionProperties = {
        [TradePropertyKeys.amountToWallet]: amountToWallet,
        [TradePropertyKeys.transactionCosts]: transactionCosts,
      };
      break;
  }

  return { transactionHeader, transactionProperties, buildTransactionCall };
}
