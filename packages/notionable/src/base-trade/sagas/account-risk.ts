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
import { formatTokenType } from '@notional-finance/helpers';

export type AccountRiskSummary = ReturnType<typeof accountRiskSummary>;

export function priorAccountRisk(
  state$: Observable<TradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([s, account]) => !!account && s.priorAccountRisk === undefined),
    map(([, account]) =>
      account
        ? accountRiskSummary(
            new AccountRiskProfile(account.balances),
            undefined
          )
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
          const prior = account
            ? new AccountRiskProfile(account.balances)
            : undefined;
          const post = AccountRiskProfile.simulate(
            account?.balances || [],
            [collateralBalance, debtBalance].filter(
              (b) => b !== undefined
            ) as TokenBalance[]
          );

          const s = accountRiskSummary(prior, post);
          return {
            ...s,
            canSubmit:
              s.postAccountRisk?.freeCollateral.isPositive() &&
              inputErrors === false,
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

function comparePortfolio(prior: TokenBalance[], post: TokenBalance[]) {
  return zipByKeyToArray(prior, post, (t) => t.tokenId)
    .map(([_current, _updated]) => {
      const updated = (_updated || _current?.copy(0)) as TokenBalance;
      const current = (_current || _updated?.copy(0)) as TokenBalance;
      const { titleWithMaturity } =
        updated.tokenType === 'PrimeCash' && current.isNegative()
          ? formatTokenType(current.toPrimeDebt().token)
          : formatTokenType(current.token);

      return {
        label: titleWithMaturity,
        current: current,
        isCurrentNegative: current.isNegative(),
        updated: updated,
        isUpdatedNegative: updated.isNegative(),
        sortOrder: updated.sub(current).abs().toFloat(),
        changeType: getChangeType(current.toFloat(), updated.toFloat()),
      };
    })
    .filter(({ current, updated }) => current.isZero() && updated.isZero())
    .sort((a, b) => b.sortOrder - a.sortOrder);
}

function accountRiskSummary(
  prior: AccountRiskProfile | undefined,
  post: AccountRiskProfile | undefined
) {
  const priorAccountRisk = prior?.getAllRiskFactors();
  const postAccountRisk = post?.getAllRiskFactors();

  return {
    priorAccountRisk,
    postAccountRisk,
    healthFactor: {
      current: priorAccountRisk?.healthFactor,
      updated: postAccountRisk?.healthFactor,
      changeType: getChangeType(
        priorAccountRisk?.healthFactor,
        postAccountRisk?.healthFactor
      ),
      greenOnArrowUp: true,
    },
    liquidationPrice: mergeLiquidationPrices(
      priorAccountRisk?.liquidationPrice || [],
      postAccountRisk?.liquidationPrice || []
    ),
    comparePortfolio:
      prior && post ? comparePortfolio(prior.balances, post.balances) : [],
  };
}
