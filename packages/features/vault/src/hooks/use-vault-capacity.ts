import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { Registry } from '@notional-finance/core-entities';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export const useVaultCapacity = () => {
  const {
    state: { debtBalance, vaultAddress },
  } = useContext(VaultActionContext);
  const network = useSelectedNetwork();

  const vaultCapacity =
    network && vaultAddress
      ? Registry.getConfigurationRegistry().getVaultCapacity(
          network,
          vaultAddress
        )
      : undefined;

  let maxVaultCapacity = '';
  let totalCapacityRemaining = '';
  let capacityUsedPercentage = 0;
  let capacityWithUserBorrowPercentage: number | undefined = undefined;
  let overCapacityError = false;
  let underMinAccountBorrow = false;

  if (vaultCapacity) {
    const {
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
    } = vaultCapacity;

    underMinAccountBorrow = debtBalance?.isNegative()
      ? debtBalance.abs().toUnderlying().lt(minAccountBorrowSize)
      : false;
    overCapacityError = debtBalance
      ? totalUsedPrimaryBorrowCapacity
          .add(debtBalance.toUnderlying())
          .gt(maxPrimaryBorrowCapacity)
      : false;
    maxVaultCapacity = maxPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
    totalCapacityRemaining = overCapacityError
      ? ''
      : maxPrimaryBorrowCapacity
          .sub(totalUsedPrimaryBorrowCapacity)
          .toDisplayStringWithSymbol(0);
    capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
      .scale(100, maxPrimaryBorrowCapacity)
      .toNumber();
    capacityWithUserBorrowPercentage = debtBalance
      ? totalUsedPrimaryBorrowCapacity
          .add(debtBalance.toUnderlying())
          .scale(100, maxPrimaryBorrowCapacity)
          .toNumber()
      : undefined;
  }

  return {
    underMinAccountBorrow,
    overCapacityError,
    totalCapacityRemaining,
    maxVaultCapacity,
    capacityUsedPercentage,
    capacityWithUserBorrowPercentage,
  };
};
