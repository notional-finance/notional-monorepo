import {
  VaultConfig,
  VaultAccount,
  TypedBigNumber,
} from '@notional-finance/sdk';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';

interface VaultCapacityDependencies {
  // Inputs
  vaultAction?: VAULT_ACTIONS;
  // Via Init
  vaultConfig: VaultConfig;
  vaultAccount?: VaultAccount;
  fCashBorrowAmount?: TypedBigNumber;
  fCashToLend?: TypedBigNumber;

  // These inputs are only here for change detection
  depositAmount?: TypedBigNumber;
  leverageRatio?: number;
  selectedMarketKey?: string;
  withdrawAmount?: TypedBigNumber;
  maxWithdraw?: boolean;
}

export function getVaultCapacity({
  vaultConfig,
  vaultAction,
  vaultAccount,
  fCashBorrowAmount,
  fCashToLend,
}: VaultCapacityDependencies) {
  const { primaryBorrowCurrency } = vaultConfig;

  let netCapacityChange: TypedBigNumber;
  if (vaultAction === VAULT_ACTIONS.ROLL_POSITION && vaultAccount) {
    // Capacity will decrease by primary borrow fCash during roll position
    netCapacityChange = fCashBorrowAmount
      ? vaultAccount.primaryBorrowfCash.add(fCashBorrowAmount.neg())
      : vaultAccount.primaryBorrowfCash;
  } else if (fCashToLend) {
    // Capacity used will decrease by fCash lent during withdraw
    netCapacityChange = fCashToLend.neg();
  } else if (fCashBorrowAmount) {
    // Capacity used will increase by fCash borrowed during entry
    netCapacityChange = fCashBorrowAmount.neg();
  } else {
    netCapacityChange = TypedBigNumber.getZeroUnderlying(primaryBorrowCurrency);
  }

  return { netCapacityChange };
}
