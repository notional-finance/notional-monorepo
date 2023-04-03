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
  leverageRatio?: number;
  // Via Init
  accountAddress?: string;
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
  accountAddress,
}: UpdatedVaultAccountDependencies) {
  const selectedMaturity = selectedMarketKey
    ? Market.parseMaturity(selectedMarketKey)
    : undefined;

  if (vaultAction === undefined) {
    return { updatedVaultAccount: undefined, buildTransactionCall: undefined };
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
      return getRollPosition(
        accountAddress,
        baseVault,
        selectedMaturity,
        vaultAccount,
        fCashBorrowAmount,
        depositAmount
      );
    } else if (
      vaultAction === VAULT_ACTIONS.CREATE_VAULT_POSITION &&
      fCashBorrowAmount &&
      depositAmount &&
      selectedMaturity
    ) {
      return getCreatePosition(
        accountAddress,
        baseVault,
        selectedMaturity,
        vaultAccount,
        fCashBorrowAmount,
        depositAmount
      );
    } else if (
      vaultAction === VAULT_ACTIONS.INCREASE_POSITION &&
      fCashBorrowAmount
    ) {
      return getIncreasePosition(
        accountAddress,
        baseVault,
        vaultAccount,
        fCashBorrowAmount,
        depositAmount
      );
    } else if (
      vaultAction === VAULT_ACTIONS.DEPOSIT_COLLATERAL &&
      depositAmount
    ) {
      return getDepositPosition(
        accountAddress,
        baseVault,
        vaultAccount,
        depositAmount
      );
    }
  } catch (e) {
    logError(
      e as NonLoggedError,
      'vault-action-manager',
      'get-updated-vault-account'
    );
    // Errors may occur when the maturity is not correct
    return { updatedVaultAccount: undefined, buildTransactionCall: undefined };
  }

  return { updatedVaultAccount: undefined, buildTransactionCall: undefined };
}

function getRollPosition(
  address: string | undefined,
  baseVault: GenericBaseVault,
  selectedMaturity: number,
  vaultAccount: VaultAccount,
  fCashBorrowAmount?: TypedBigNumber,
  depositAmount = TypedBigNumber.getZeroUnderlying(
    baseVault.getVault().primaryBorrowCurrency
  )
) {
  let updatedVaultAccount: VaultAccount;

  const depositInternal = depositAmount.toInternalPrecision();
  const { newVaultAccount, fCashToBorrowForRepayment } =
    baseVault.simulateRollPosition(
      vaultAccount,
      selectedMaturity,
      depositInternal,
      tradeDefaults.defaultAnnualizedSlippage
    );

  if (fCashBorrowAmount && fCashBorrowAmount.lt(fCashToBorrowForRepayment)) {
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

  return {
    updatedVaultAccount,
    buildTransactionCall: address
      ? {
          transactionFn: baseVault.populateRollTransaction.bind(baseVault),
          transactionArgs: [
            address,
            selectedMaturity,
            depositAmount.toExternalPrecision(),
            fCashBorrowAmount || fCashToBorrowForRepayment,
            tradeDefaults.defaultAnnualizedSlippage,
            vaultAccount,
          ],
        }
      : undefined,
  };
}

function getCreatePosition(
  address: string | undefined,
  baseVault: GenericBaseVault,
  selectedMaturity: number,
  vaultAccount: VaultAccount,
  fCashBorrowAmount: TypedBigNumber,
  depositAmount: TypedBigNumber
) {
  const { newVaultAccount: updatedVaultAccount } = baseVault.simulateEnter(
    vaultAccount,
    selectedMaturity,
    fCashBorrowAmount,
    depositAmount.toInternalPrecision()
  );

  return {
    updatedVaultAccount,
    buildTransactionCall: address
      ? {
          transactionFn: baseVault.populateEnterTransaction.bind(baseVault),
          transactionArgs: [
            address,
            depositAmount.toExternalPrecision(),
            selectedMaturity,
            fCashBorrowAmount,
            tradeDefaults.defaultAnnualizedSlippage,
          ],
        }
      : undefined,
  };
}

function getIncreasePosition(
  address: string | undefined,
  baseVault: GenericBaseVault,
  vaultAccount: VaultAccount,
  fCashBorrowAmount: TypedBigNumber,
  depositAmount = TypedBigNumber.getZeroUnderlying(
    baseVault.getVault().primaryBorrowCurrency
  )
) {
  const { newVaultAccount: updatedVaultAccount } = baseVault.simulateEnter(
    vaultAccount,
    vaultAccount.maturity,
    fCashBorrowAmount,
    depositAmount.toInternalPrecision()
  );

  return {
    updatedVaultAccount,
    buildTransactionCall: address
      ? {
          transactionFn: baseVault.populateEnterTransaction.bind(baseVault),
          transactionArgs: [
            address,
            depositAmount.toExternalPrecision(),
            vaultAccount.maturity,
            fCashBorrowAmount,
            tradeDefaults.defaultAnnualizedSlippage,
          ],
        }
      : undefined,
  };
}

function getDepositPosition(
  address: string | undefined,
  baseVault: GenericBaseVault,
  vaultAccount: VaultAccount,
  depositAmount: TypedBigNumber
) {
  const fCashBorrowAmount = TypedBigNumber.getZeroUnderlying(
    baseVault.getVault().primaryBorrowCurrency
  );

  const { newVaultAccount: updatedVaultAccount } = baseVault.simulateEnter(
    vaultAccount,
    vaultAccount.maturity,
    fCashBorrowAmount,
    depositAmount.toInternalPrecision()
  );

  return {
    updatedVaultAccount,
    buildTransactionCall: address
      ? {
          transactionFn: baseVault.populateEnterTransaction.bind(baseVault),
          transactionArgs: [
            address,
            depositAmount.toExternalPrecision(),
            vaultAccount.maturity,
            fCashBorrowAmount,
            tradeDefaults.defaultAnnualizedSlippage,
          ],
        }
      : undefined,
  };
}
