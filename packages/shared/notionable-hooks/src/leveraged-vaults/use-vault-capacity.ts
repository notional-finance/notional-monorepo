import { useVault } from './use-vault';
import { TypedBigNumber } from '@notional-finance/sdk';

export const useVaultCapacity = (vaultAddress?: string, _fCashToBorrow?: TypedBigNumber) => {
  const { vaultConfig, primaryBorrowSymbol } = useVault(vaultAddress);

  let maxVaultCapacity = '';
  let totalCapacityUsed = '';
  let capacityUsedPercentage = 0;
  let capacityWithUserBorrowPercentage: number | undefined = undefined;
  let overCapacityError = false;
  let underMinAccountBorrow = false;
  const fCashToBorrow = _fCashToBorrow?.neg();

  if (vaultConfig && primaryBorrowSymbol) {
    const { minAccountBorrowSize, totalUsedPrimaryBorrowCapacity, maxPrimaryBorrowCapacity } =
      vaultConfig;

    underMinAccountBorrow = fCashToBorrow ? fCashToBorrow.lt(minAccountBorrowSize) : false;
    overCapacityError = fCashToBorrow
      ? fCashToBorrow.add(totalUsedPrimaryBorrowCapacity).gt(maxPrimaryBorrowCapacity)
      : false;
    maxVaultCapacity = maxPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    totalCapacityUsed = totalUsedPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
      .scale(100, maxPrimaryBorrowCapacity)
      .toNumber();
    capacityWithUserBorrowPercentage = fCashToBorrow
      ? totalUsedPrimaryBorrowCapacity
          .add(fCashToBorrow)
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
