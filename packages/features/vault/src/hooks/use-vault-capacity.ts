import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import {
  useSelectedNetwork,
  useVaultAccount,
} from '@notional-finance/notionable-hooks';

export const useVaultCapacity = () => {
  const {
    state: { debtBalance, vaultAddress, debt },
  } = useContext(VaultActionContext);
  const network = useSelectedNetwork();
  const { vaultBalances } = useVaultAccount(vaultAddress);

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
  let minBorrowSize: string | undefined = undefined;

  const totalAccountDebt =
    debt && debtBalance
      ? (
          vaultBalances.find((t) => t.tokenId === debtBalance?.tokenId) ||
          TokenBalance.zero(debt)
        ).add(debtBalance)
      : undefined;

  if (vaultCapacity) {
    const {
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
    } = vaultCapacity;

    minBorrowSize = minAccountBorrowSize.toDisplayStringWithSymbol(0);
    underMinAccountBorrow = totalAccountDebt?.isNegative()
      ? totalAccountDebt.abs().toUnderlying().lt(minAccountBorrowSize)
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
    minBorrowSize,
    underMinAccountBorrow,
    overCapacityError,
    totalCapacityRemaining,
    maxVaultCapacity,
    capacityUsedPercentage,
    capacityWithUserBorrowPercentage,
  };
};
