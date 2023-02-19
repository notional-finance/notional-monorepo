import {
  GenericBaseVault,
  TypedBigNumber,
  VaultAccount,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { tradeDefaults, VAULT_ACTIONS } from '@notional-finance/shared-config';

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
    console.log(e);
    // Errors may occur when the maturity is not correct
    return { updatedVaultAccount };
  }

  return { updatedVaultAccount };
}
