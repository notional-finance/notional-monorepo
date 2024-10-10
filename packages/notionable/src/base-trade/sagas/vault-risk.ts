import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import {
  PRIME_CASH_VAULT_MATURITY,
  filterEmpty,
  getChangeType,
  leveragedYield,
} from '@notional-finance/util';
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
        p.vaultAddress === c.vaultAddress && prevA?.address === curA?.address
    ),
    filter(([s]) => s.priorAccountRisk === undefined),
    map(([{ vaultAddress }, account]) => {
      if (!vaultAddress || !account) return undefined;
      return vaultRiskSummary(
        VaultAccountRiskProfile.fromAccount(vaultAddress, account),
        undefined,
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
          vaultCapacityError,
          calculationSuccess,
          collateralBalance,
          debtOptions,
          debtBalance,
          vaultAddress,
          tradeType,
          inputErrors,
        },
      ]) => {
        if (!vaultAddress) return undefined;
        const prior = account
          ? VaultAccountRiskProfile.fromAccount(vaultAddress, account)
          : undefined;
        const post =
          calculationSuccess && collateralBalance
            ? (tradeType === 'RollVaultPosition' ||
                tradeType === 'CreateVaultPosition') &&
              debtBalance
              ? new VaultAccountRiskProfile(
                  vaultAddress,
                  [collateralBalance, debtBalance],
                  0
                )
              : prior?.simulate(
                  [collateralBalance, debtBalance].filter(
                    (b) => b !== undefined
                  ) as TokenBalance[]
                )
            : undefined;

        const s = vaultRiskSummary(
          prior,
          post,
          debtOptions?.find((t) => t.token.id === debtBalance?.tokenId)
            ?.interestRate
        );

        return {
          ...s,
          canSubmit:
            (s.postAccountRisk?.leverageRatio === null ||
              (!!post?.maxLeverageRatio &&
                !!s?.postAccountRisk?.leverageRatio &&
                s.postAccountRisk.leverageRatio < post.maxLeverageRatio)) &&
            account !== null &&
            vaultCapacityError === false &&
            inputErrors === false,
        };
      }
    ),
    filterEmpty()
  );
}

function averageFixedRate(
  prior: VaultAccountRiskProfile | undefined,
  post: VaultAccountRiskProfile | undefined,
  newBorrowRate: number | undefined
) {
  if (
    prior?.maturity === post?.maturity &&
    newBorrowRate !== undefined &&
    prior?.lastImpliedFixedRate !== undefined &&
    post?.vaultDebt !== undefined
  ) {
    return (
      (prior.lastImpliedFixedRate * prior.vaultDebt.toFloat() +
        (newBorrowRate - prior.lastImpliedFixedRate) *
          post.vaultDebt.toFloat()) /
      prior.vaultDebt.toFloat()
    );
  } else {
    return newBorrowRate;
  }
}

function vaultRiskSummary(
  prior: VaultAccountRiskProfile | undefined,
  post: VaultAccountRiskProfile | undefined,
  newBorrowRate: number | undefined
) {
  const priorAccountRisk = prior?.getAllRiskFactors();
  const postAccountRisk = post?.getAllRiskFactors();
  // const network = prior?.network || post?.network;
  // const yields = network
  //   ? Registry.getYieldRegistry().getAllYields(network)
  //   : [];

  const priorBorrowRate = prior?.borrowAPY;
  const priorAPY = prior?.totalAPY;
  const postBorrowRate =
    post?.maturity === PRIME_CASH_VAULT_MATURITY
      ? newBorrowRate
      : averageFixedRate(prior, post, newBorrowRate);
  const vaultSharesAPY = 0;
  // const vaultSharesAPY = yields.find(
  //   (y) =>
  //     y.token.tokenType === 'VaultShare' &&
  //     y.token.vaultAddress === (prior?.vaultAddress || post?.vaultAddress)
  // )?.totalAPY;
  const postAPY = leveragedYield(
    vaultSharesAPY,
    postBorrowRate,
    postAccountRisk?.leverageRatio || 0
  );

  return {
    priorAccountRisk,
    postAccountRisk,
    priorVaultBalances: prior?.balances,
    postTradeBalances: post?.balances,
    healthFactor: {
      current: priorAccountRisk?.healthFactor,
      updated: postAccountRisk?.healthFactor,
      changeType: getChangeType(
        priorAccountRisk?.healthFactor,
        postAccountRisk?.healthFactor
      ),
      greenOnArrowUp: true,
    },
    netWorth: {
      current: priorAccountRisk?.netWorth,
      updated: postAccountRisk?.netWorth,
      changeType: getChangeType(
        priorAccountRisk?.netWorth?.toFloat(),
        postAccountRisk?.netWorth?.toFloat()
      ),
      greenOnArrowUp: true,
    },
    borrowAPY: {
      current: priorBorrowRate,
      updated: postBorrowRate,
      changeType: getChangeType(priorBorrowRate, postBorrowRate),
      greenOnArrowUp: false,
    },
    totalAPY: {
      current: priorAPY,
      updated: postAPY,
      changeType: getChangeType(priorAPY, postAPY),
      greenOnArrowUp: true,
    },
    liquidationPrice: mergeLiquidationPrices(
      priorAccountRisk?.liquidationPrice || [],
      postAccountRisk?.liquidationPrice || []
    ),
    comparePortfolio: post
      ? comparePortfolio(prior?.balances || [], post.balances)
      : [],
  };
}
