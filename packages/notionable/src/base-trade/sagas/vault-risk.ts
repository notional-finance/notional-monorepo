import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { filterEmpty, getChangeType } from '@notional-finance/util';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs';
import { VaultTradeState } from '../base-trade-store';
import { comparePortfolio, mergeLiquidationPrices } from './account-risk';

export type VaultAccountRiskSummary = ReturnType<typeof vaultRiskSummary>;

export function priorVaultAccountRisk(
  state$: Observable<VaultTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    distinctUntilChanged(
      ([p, prevA], [c, curA]) =>
        p.vaultAddress === c.vaultAddress &&
        p.tradeType === c.tradeType &&
        prevA?.address === curA?.address
    ),
    filter(([s]) => s.priorAccountRisk === undefined),
    map(([{ vaultAddress }, account]) => {
      if (!vaultAddress || !account) return undefined;
      return vaultRiskSummary(
        VaultAccountRiskProfile.fromAccount(vaultAddress, account),
        undefined
      );
    }),
    filterEmpty()
  );
}

export function postVaultAccountRisk(
  state$: Observable<VaultTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([account$, state$]).pipe(
    distinctUntilChanged(
      ([, p], [, c]) =>
        p.tradeType === c.tradeType &&
        p.calculationSuccess === c.calculationSuccess &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        p.inputErrors === c.inputErrors
    ),
    map(
      ([
        account,
        {
          calculationSuccess,
          collateralBalance,
          debtBalance,
          vaultAddress,
          tradeType,
          inputErrors,
        },
      ]) => {
        if (!vaultAddress || !account) return undefined;
        const prior = VaultAccountRiskProfile.fromAccount(
          vaultAddress,
          account
        );
        const post =
          calculationSuccess && collateralBalance
            ? VaultAccountRiskProfile.simulate(
                vaultAddress,
                account?.balances.filter((t) =>
                  // During a roll vault position, new debt and collateral will be specified
                  tradeType === 'RollVaultPosition'
                    ? false
                    : t.isVaultToken && t.vaultAddress === vaultAddress
                ) || [],
                [collateralBalance, debtBalance].filter(
                  (b) => b !== undefined
                ) as TokenBalance[]
              )
            : undefined;
        const s = vaultRiskSummary(prior, post);

        return {
          ...s,
          canSubmit:
            s.postAccountRisk?.leverageRatio &&
            post?.maxLeverageRatio &&
            s.postAccountRisk.leverageRatio < post.maxLeverageRatio &&
            account !== null &&
            inputErrors === false,
        };
      }
    ),
    filterEmpty()
  );
}

function vaultRiskSummary(
  prior: VaultAccountRiskProfile | undefined,
  post: VaultAccountRiskProfile | undefined
) {
  const priorAccountRisk = prior?.getAllRiskFactors();
  const postAccountRisk = post?.getAllRiskFactors();

  // TODO: blended apy, total apy
  return {
    priorAccountRisk,
    postAccountRisk,
    priorVaultBalances: prior?.balances,
    postTradeBalances: post?.balances,
    netWorth: {
      current: priorAccountRisk?.netWorth,
      updated: postAccountRisk?.netWorth,
      changeType: getChangeType(
        priorAccountRisk?.netWorth?.toFloat(),
        postAccountRisk?.netWorth?.toFloat()
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
