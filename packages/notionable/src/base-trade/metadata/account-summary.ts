import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { filterEmpty } from '@notional-finance/util';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { BaseTradeState } from '../base-trade-store';

export function tradeSummary(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([account$, state$]).pipe(
    distinctUntilChanged(
      ([, p], [, c]) =>
        p.canSubmit === c.canSubmit &&
        p.depositBalance?.hashKey === c.depositBalance?.hashKey &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        p.tradeType === c.tradeType
    ),
    map(
      ([
        account,
        {
          inputsSatisfied,
          calculationSuccess,
          collateralBalance,
          debtBalance,
          tradeType,
        },
      ]) => {
        if (
          inputsSatisfied &&
          calculationSuccess &&
          !collateralBalance?.isVaultToken &&
          !debtBalance?.isVaultToken
        ) {
          // Skip vault shares and vault debt
          return getNetBalances(
            account?.balances || [],
            tradeType === 'RollDebt'
              ? debtBalance
              : tradeType === 'ConvertAsset'
              ? collateralBalance
              : collateralBalance || debtBalance
          );
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}

function getNetBalances(
  accountBalances: TokenBalance[],
  netChange: TokenBalance | undefined
) {
  if (!netChange) return undefined;

  const zero = netChange.copy(0);
  const start =
    accountBalances.find((b) => b.tokenId === netChange.tokenId) || zero;
  const end = start.add(netChange);
  if (start.eq(end) || (start.gte(zero) && end.gte(zero))) {
    // Only asset changes
    return { netAssetBalance: netChange, netDebtBalance: zero };
  } else if (start.lte(zero) && end.lte(zero)) {
    // Only debt changes
    return { netAssetBalance: zero, netDebtBalance: netChange };
  } else if (start.gte(zero) && end.lte(zero)) {
    // Entire start balance has decreased to zero, entire negative balance is created
    return { netAssetBalance: start.neg(), netDebtBalance: end };
  } else if (start.lte(zero) && end.gte(zero)) {
    // Entire start balance has been repaid, entire positive balance is created
    return { netAssetBalance: end, netDebtBalance: start.neg() };
  }

  throw Error('unknown balance change');
}
