import {
  GenericBaseVault,
  TypedBigNumber,
  VaultAccount,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { tradeDefaults, VAULT_ACTIONS } from '@notional-finance/shared-config';
import { logError, NonLoggedError } from '@notional-finance/util';

interface UpdatedVaultAccountDependencies {
  // Inputs
  vaultAction?: VAULT_ACTIONS;
  depositAmount?: TypedBigNumber;
  selectedMarketKey?: string;
  fCashBorrowAmount?: TypedBigNumber;
  // Via Init
  vaultAccount: VaultAccount;
  baseVault: GenericBaseVault;
}

export function getUpdatedVaultAccount({
  vaultAccount,
  baseVault,
  vaultAction,
  fCashBorrowAmount,
  depositAmount,
  selectedMarketKey,
}: UpdatedVaultAccountDependencies) {
  let updatedVaultAccount: VaultAccount | undefined;
  const selectedMaturity = selectedMarketKey
    ? Market.parseMaturity(selectedMarketKey)
    : undefined;

  if (vaultAction === undefined) {
    return { updatedVaultAccount };
  } else if (
    [
      VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
      VAULT_ACTIONS.WITHDRAW_VAULT,
      VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY,
    ].includes(vaultAction)
  ) {
    // Do not return anything if one of the withdraw methods is defined here,
    // updated vault account is returned from get-withdraw-amount-data instead
    return {};
  }

  try {
    if (vaultAction === VAULT_ACTIONS.ROLL_POSITION && selectedMaturity) {
      // Set this to zero if it is unset, it is optional during these two actions
      const depositInternal =
        depositAmount?.toInternalPrecision() ||
        TypedBigNumber.getZeroUnderlying(
          baseVault.getVault().primaryBorrowCurrency
        );

      const { newVaultAccount, fCashToBorrowForRepayment } =
        baseVault.simulateRollPosition(
          vaultAccount,
          selectedMaturity,
          depositInternal.toInternalPrecision(),
          tradeDefaults.defaultAnnualizedSlippage
        );

      if (
        fCashBorrowAmount &&
        fCashBorrowAmount.lt(fCashToBorrowForRepayment)
      ) {
        // This is any additional borrow beyond the original
        updatedVaultAccount = baseVault.simulateEnter(
          newVaultAccount,
          selectedMaturity,
          fCashBorrowAmount.sub(fCashToBorrowForRepayment),
          depositInternal.copy(0)
        ).newVaultAccount;
      } else {
        updatedVaultAccount = newVaultAccount;
      }
    } else if (
      vaultAction === VAULT_ACTIONS.CREATE_VAULT_POSITION &&
      fCashBorrowAmount &&
      depositAmount &&
      selectedMaturity
    ) {
      updatedVaultAccount = baseVault.simulateEnter(
        vaultAccount,
        selectedMaturity,
        fCashBorrowAmount,
        depositAmount.toInternalPrecision()
      ).newVaultAccount;
    } else if (
      vaultAction === VAULT_ACTIONS.INCREASE_POSITION &&
      fCashBorrowAmount
    ) {
      updatedVaultAccount = baseVault.simulateEnter(
        vaultAccount,
        vaultAccount.maturity,
        fCashBorrowAmount,
        // Deposit amount is optional when increasing position
        depositAmount?.toInternalPrecision() ||
          TypedBigNumber.getZeroUnderlying(
            baseVault.getVault().primaryBorrowCurrency
          )
      ).newVaultAccount;
    } else if (
      vaultAction === VAULT_ACTIONS.DEPOSIT_COLLATERAL &&
      depositAmount
    ) {
      updatedVaultAccount = baseVault.simulateEnter(
        vaultAccount,
        vaultAccount.maturity,
        TypedBigNumber.getZeroUnderlying(
          baseVault.getVault().primaryBorrowCurrency
        ),
        depositAmount.toInternalPrecision()
      ).newVaultAccount;
    }
  } catch (e) {
    logError(
      e as NonLoggedError,
      'vault-action-manager',
      'get-updated-vault-account'
    );
    // Errors may occur when the maturity is not correct
    return { updatedVaultAccount: undefined };
  }

  return { updatedVaultAccount };
}
