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
        { debt, debtBalance, vaultAddress, priorVaultBalances, tradeType },
        network,
      ]) => {
        const vaultCapacity =
          network && vaultAddress
            ? Registry.getConfigurationRegistry().getVaultCapacity(
                network,
                vaultAddress
              )
            : undefined;

        let totalCapacityRemaining: TokenBalance | undefined;
        let overCapacityError = false;
        let minBorrowSize: string | undefined = undefined;
        let underMinAccountBorrow = false;
        let vaultTVL: TokenBalance | undefined;

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

          minBorrowSize =
            minAccountBorrowSize.toFloat() < 10
              ? minAccountBorrowSize.toDisplayStringWithSymbol(1)
              : minAccountBorrowSize.toDisplayStringWithSymbol(0);
          overCapacityError = debtBalance
            ? totalUsedPrimaryBorrowCapacity
                .add(debtBalance.neg().toUnderlying())
                .gt(maxPrimaryBorrowCapacity)
            : false;
          totalCapacityRemaining = overCapacityError
            ? undefined
            : maxPrimaryBorrowCapacity.sub(totalUsedPrimaryBorrowCapacity);
          vaultTVL = Registry.getTokenRegistry()
            .getAllTokens(network)
            .filter(
              (t) =>
                t.tokenType === 'VaultShare' && t.vaultAddress === vaultAddress
            )
            .reduce((tvl, t) => {
              if (t.totalSupply) {
                return tvl.add(t.totalSupply.toUnderlying());
              } else {
                return tvl;
              }
            }, TokenBalance.zero(minAccountBorrowSize.token));
        }

        return {
          minBorrowSize,
          overCapacityError,
          underMinAccountBorrow,
          totalCapacityRemaining,
          vaultTVL,
          vaultCapacityError:
            tradeType === 'WithdrawVault'
              ? false
              : overCapacityError || underMinAccountBorrow,
        };
      }
    ),
    filterEmpty()
  );
}
