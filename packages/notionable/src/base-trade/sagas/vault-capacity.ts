import {
  AccountDefinition,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { filterEmpty } from '@notional-finance/util';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { VaultTradeState } from '../base-trade-store';
import { selectedNetwork } from '../../global';

export function vaultCapacity(
  state$: Observable<VaultTradeState>,
  account$: Observable<AccountDefinition | null>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([account$, state$, selectedNetwork$]).pipe(
    distinctUntilChanged(
      ([, p], [, c]) =>
        p.tradeType === c.tradeType &&
        p.calculationSuccess === c.calculationSuccess &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.inputErrors === c.inputErrors &&
        c.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        c.vaultAddress === c.vaultAddress
    ),
    map(
      ([
        _,
        { debt, debtBalance, vaultAddress, priorVaultBalances },
        network,
      ]) => {
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
        let minBorrowSize: string | undefined = undefined;
        let underMinAccountBorrow = false;

        if (vaultCapacity) {
          const {
            minAccountBorrowSize,
            totalUsedPrimaryBorrowCapacity,
            maxPrimaryBorrowCapacity,
          } = vaultCapacity;

          const totalAccountDebt =
            debt && debtBalance && debt.id === debtBalance.tokenId
              ? (
                  priorVaultBalances?.find(
                    (t) => t.tokenId === debtBalance?.tokenId
                  ) || TokenBalance.zero(debt)
                ).add(debtBalance)
              : undefined;

          underMinAccountBorrow = totalAccountDebt?.isNegative()
            ? totalAccountDebt.abs().toUnderlying().lt(minAccountBorrowSize)
            : false;

          minBorrowSize = minAccountBorrowSize.toDisplayStringWithSymbol(0);
          overCapacityError = debtBalance
            ? totalUsedPrimaryBorrowCapacity
                .add(debtBalance.neg().toUnderlying())
                .gt(maxPrimaryBorrowCapacity)
            : false;
          maxVaultCapacity =
            maxPrimaryBorrowCapacity.toDisplayStringWithSymbol(0);
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
                .add(debtBalance.neg().toUnderlying())
                .scale(100, maxPrimaryBorrowCapacity)
                .toNumber()
            : undefined;
        }

        return {
          minBorrowSize,
          maxVaultCapacity,
          overCapacityError,
          underMinAccountBorrow,
          totalCapacityRemaining,
          capacityUsedPercentage,
          capacityWithUserBorrowPercentage,
          vaultCapacityError: overCapacityError || underMinAccountBorrow,
        };
      }
    ),
    filterEmpty()
  );
}
