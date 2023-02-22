import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';

export const useVaultCapacity = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultConfig, fCashBorrowAmount, vaultAction, vaultAccount } = state;

  let maxVaultCapacity = '';
  let totalCapacityUsed = '';
  let capacityUsedPercentage = 0;
  let capacityWithUserBorrowPercentage: number | undefined = undefined;
  let overCapacityError = false;
  let underMinAccountBorrow = false;
  const fCashToBorrow = fCashBorrowAmount?.neg();

  if (vaultConfig) {
    const {
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
    } = vaultConfig;

    let fCashRepaid = minAccountBorrowSize.copy(0);
    if (vaultAction === VAULT_ACTIONS.ROLL_POSITION && vaultAccount) {
      // When rolling positions, the existing fCash debt will be repaid
      fCashRepaid = vaultAccount.primaryBorrowfCash;
    }

    underMinAccountBorrow = fCashToBorrow
      ? fCashToBorrow.lt(minAccountBorrowSize)
      : false;
    overCapacityError = fCashToBorrow
      ? fCashToBorrow
          .add(totalUsedPrimaryBorrowCapacity)
          .add(fCashRepaid)
          .gt(maxPrimaryBorrowCapacity)
      : false;
    maxVaultCapacity = maxPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    totalCapacityUsed =
      totalUsedPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
      .scale(100, maxPrimaryBorrowCapacity)
      .toNumber();
    capacityWithUserBorrowPercentage = fCashToBorrow
      ? totalUsedPrimaryBorrowCapacity
          .add(fCashToBorrow)
          .add(fCashRepaid)
          .scale(100, maxPrimaryBorrowCapacity)
          .toNumber()
      : undefined;
  }

  return {
    underMinAccountBorrow,
    overCapacityError,
    totalCapacityUsed,
    maxVaultCapacity,
    capacityUsedPercentage,
    capacityWithUserBorrowPercentage,
  };
};
