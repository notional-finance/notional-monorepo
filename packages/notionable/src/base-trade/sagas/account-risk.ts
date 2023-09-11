import {
  AccountDefinition,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import {
  filterEmpty,
  getChangeType,
  zipByKeyToArray,
} from '@notional-finance/util';
import {
  Observable,
  combineLatest,
  filter,
  map,
  distinctUntilChanged,
} from 'rxjs';
import { TradeState, BaseTradeState } from '../base-trade-store';

export function priorAccountRisk(
  state$: Observable<TradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([s, account]) => !!account && s.priorAccountRisk === undefined),
    map(([, account]) => {
      if (account) {
        const priorAccountRisk = new AccountRiskProfile(
          account.balances
        ).getAllRiskFactors();

        return {
          priorAccountRisk,
          accountRiskSummary: accountRiskSummary(priorAccountRisk, undefined),
        };
      } else {
        return undefined;
      }
    }),
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
          const priorAccountRisk = account
            ? new AccountRiskProfile(account.balances)
            : undefined;
          const postAccountRisk = AccountRiskProfile.simulate(
            account?.balances || [],
            [collateralBalance, debtBalance].filter(
              (b) => b !== undefined
            ) as TokenBalance[]
          );
          const riskFactors = postAccountRisk.getAllRiskFactors();

          return {
            postAccountRisk: riskFactors,
            canSubmit:
              riskFactors.freeCollateral.isPositive() && inputErrors === false,
            postTradeBalances: postAccountRisk.balances,
            accountRiskSummary: accountRiskSummary(
              priorAccountRisk?.getAllRiskFactors(),
              riskFactors
            ),
          };
        } else if (!calculationSuccess) {
          return {
            postAccountRisk: undefined,
            canSubmit: false,
            postTradeBalances: undefined,
            accountRiskSummary: undefined,
          };
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}

function mergeLiquidationPrices(
  prior: ReturnType<AccountRiskProfile['getAllLiquidationPrices']>,
  post: ReturnType<AccountRiskProfile['getAllLiquidationPrices']>
) {
  return zipByKeyToArray(prior, post, (t) => t.asset.id).map(
    ([current, updated]) => {
      const asset = (current?.asset || updated?.asset) as TokenDefinition;
      return {
        asset,
        current: current?.threshold,
        updated: updated?.threshold,
        changeType: getChangeType(
          current?.threshold?.toFloat(),
          updated?.threshold?.toFloat()
        ),
        // Debt thresholds improve as they increase
        greenOnArrowUp: updated?.isDebtThreshold ? true : false,
        isPriceRisk: asset.tokenType === 'Underlying',
        isAssetRisk: asset.tokenType !== 'Underlying',
      };
    }
  );
}

function accountRiskSummary(
  prior: ReturnType<AccountRiskProfile['getAllRiskFactors']> | undefined,
  post: ReturnType<AccountRiskProfile['getAllRiskFactors']> | undefined
) {
  return {
    healthFactor: {
      current: prior?.healthFactor,
      updated: prior?.healthFactor,
      changeType: getChangeType(prior?.healthFactor, post?.healthFactor),
      greenOnArrowUp: true,
    },
    liquidationPrice: mergeLiquidationPrices(
      prior?.liquidationPrice || [],
      post?.liquidationPrice || []
    ),
  };
}

export type AccountRiskSummary = ReturnType<typeof accountRiskSummary>;
