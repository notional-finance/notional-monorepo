import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';

export const useVaultCapacity = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultConfig, fCashBorrowAmount, netCapacityChange } = state;

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

    underMinAccountBorrow = fCashToBorrow
      ? fCashToBorrow.lt(minAccountBorrowSize)
      : false;
    overCapacityError = netCapacityChange
      ? totalUsedPrimaryBorrowCapacity
          .add(netCapacityChange)
          .gt(maxPrimaryBorrowCapacity)
      : false;
    maxVaultCapacity = maxPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    totalCapacityUsed =
      totalUsedPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
      .scale(100, maxPrimaryBorrowCapacity)
      .toNumber();
    capacityWithUserBorrowPercentage = netCapacityChange
      ? totalUsedPrimaryBorrowCapacity
          .add(netCapacityChange)
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
