import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { selectedNetwork } from '../../global';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { filterEmpty } from '@notional-finance/util';
import {
  Observable,
  combineLatest,
  filter,
  withLatestFrom,
  map,
  distinctUntilChanged,
} from 'rxjs';
import { TradeState, BaseTradeState } from '../base-trade-store';

export function priorAccountRisk(
  state$: Observable<TradeState>,
  account$: Observable<AccountDefinition | null>,
  network$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([s, account]) => !!account && s.priorAccountRisk === undefined),
    withLatestFrom(network$),
    map(([[, account], network]) =>
      account
        ? {
            priorAccountRisk: new AccountRiskProfile(
              account.balances.filter(
                (t) =>
                  t.tokenType !== 'Underlying' &&
                  t.tokenType !== 'NOTE' &&
                  !t.isVaultToken
              ),
              network
            ).getAllRiskFactors(),
          }
        : undefined
    ),
    filterEmpty()
  );
}

export function postAccountRisk(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([account$, state$]).pipe(
    distinctUntilChanged(
      ([, p], [, c]) =>
        p.calculationSuccess === c.calculationSuccess &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        p.inputErrors === c.inputErrors
    ),
    map(
      ([
        account,
        { calculationSuccess, collateralBalance, debtBalance, inputErrors },
      ]) => {
        if (calculationSuccess && (collateralBalance || debtBalance)) {
          const profile = AccountRiskProfile.simulate(
            account?.balances.filter((t) => t.tokenType !== 'Underlying') || [],
            [collateralBalance, debtBalance].filter(
              (b) => b !== undefined
            ) as TokenBalance[]
          );
          const postAccountRisk = profile.getAllRiskFactors();

          return {
            postAccountRisk: postAccountRisk,
            canSubmit:
              postAccountRisk.freeCollateral.isPositive() &&
              inputErrors === false,
            postTradeBalances: profile.balances,
          };
        } else if (!calculationSuccess) {
          return {
            postAccountRisk: undefined,
            canSubmit: false,
            postTradeBalances: undefined,
          };
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}
