import {
  AccountDefinition,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { PRIME_CASH_VAULT_MATURITY, filterEmpty } from '@notional-finance/util';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { VaultTradeState } from '../base-trade-store';
import { selectedNetwork } from '../../global';

function toCapacityValue(balance: TokenBalance) {
  return balance.maturity !== PRIME_CASH_VAULT_MATURITY
    ? // fCash is 1-1 in internal precision
      balance.toUnderlying().copy(balance?.n).scaleFromInternal().abs()
    : balance.toUnderlying().abs();
}

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
        {
          debtBalance,
          vaultAddress,
          priorVaultBalances,
          tradeType,
          collateralBalance,
        },
        network,
      ]) => {
        const vaultCapacity =
          network && vaultAddress
            ? Registry.getConfigurationRegistry().getVaultCapacity(
                network,
                vaultAddress
              )
            : undefined;
        const vaultAdapter =
          network && vaultAddress
            ? Registry.getVaultRegistry().getVaultAdapter(network, vaultAddress)
            : undefined;

        let totalCapacityRemaining: TokenBalance | undefined;
        let totalPoolCapacityRemaining: TokenBalance | undefined;
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

          // If the debt balance is the same as the current debt then
          // sum them together, otherwise just go with the new debt balance
          const priorDebtBalance = priorVaultBalances?.find(
            (t) => t.tokenType === 'VaultDebt'
          );

          const totalAccountDebt =
            debtBalance && priorDebtBalance?.tokenId === debtBalance?.tokenId
              ? priorDebtBalance?.add(debtBalance)
              : debtBalance;

          underMinAccountBorrow = totalAccountDebt?.isNegative()
            ? toCapacityValue(totalAccountDebt).lt(minAccountBorrowSize)
            : false;

          const netDebtBalanceForCapacity =
            // When rolling the debt position, only add the net value to the capacity
            tradeType === 'RollVaultPosition' &&
            priorDebtBalance &&
            totalAccountDebt
              ? toCapacityValue(totalAccountDebt).sub(
                  toCapacityValue(priorDebtBalance)
                )
              : totalAccountDebt
              ? toCapacityValue(totalAccountDebt)
              : undefined;

          if (netDebtBalanceForCapacity && debtBalance?.isNegative()) {
            overCapacityError =
              // Over capacity due to borrow
              totalUsedPrimaryBorrowCapacity
                .add(netDebtBalanceForCapacity)
                .gt(maxPrimaryBorrowCapacity) ||
              // Over capacity due to max pool share
              vaultAdapter?.isOverMaxPoolShare(collateralBalance) ||
              false;
          }

          totalCapacityRemaining = maxPrimaryBorrowCapacity.sub(
            totalUsedPrimaryBorrowCapacity
          );
          totalPoolCapacityRemaining = vaultAdapter?.getRemainingPoolCapacity();

          // NOTE: these two values below do not need to be recalculated inside the observable
          minBorrowSize =
            minAccountBorrowSize.toFloat() < 10
              ? minAccountBorrowSize.toDisplayStringWithSymbol(1)
              : minAccountBorrowSize.toDisplayStringWithSymbol(0);
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
          totalPoolCapacityRemaining,
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
