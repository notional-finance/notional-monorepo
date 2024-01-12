import {
  RATE_PRECISION,
  convertToSignedfCashId,
  leveragedYield,
} from '@notional-finance/util';
import { AccruedIncentives } from './incentives';
import {
  AccountDefinition,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';

export type PortfolioHolding = ReturnType<typeof calculateHoldings>[number];
export type GroupedHolding = ReturnType<
  typeof calculateGroupedHoldings
>[number];
export type VaultHolding = ReturnType<typeof calculateVaultHoldings>[number];

/**
 * Exposes all the relevant information for account holdings in the normal portfolio,
 * excludes Vault, Underlying and NOTE balances
 */
export function calculateHoldings(
  account: AccountDefinition,
  accruedIncentives: AccruedIncentives[]
) {
  const balances = account.balances
    .filter(
      (b) =>
        !b.isZero() &&
        !b.isVaultToken &&
        b.token.tokenType !== 'Underlying' &&
        b.token.tokenType !== 'NOTE'
    )
    .sort((a, b) => a.currencyId - b.currencyId);

  const nonLeveragedYields = Registry.getYieldRegistry().getNonLeveragedYields(
    account.network
  );

  const holdings = balances.map((balance) => {
    const statement = account.balanceStatement?.find(
      (s) =>
        s.token.id ===
        // Balance statements use signed fCash ids
        convertToSignedfCashId(balance.tokenId, balance.isNegative())
    );

    // Convert the matured fcash token to pcash or pdebt token id
    const maturedTokenId = balance.hasMatured
      ? balance.isPositive()
        ? balance.toPrimeCash().tokenId
        : balance.toPrimeDebt().tokenId
      : balance.token.id;

    const manageTokenId = balance.hasMatured
      ? balance.isPositive()
        ? // This is the opposite of `maturedTokenId`
          balance.toPrimeDebt().tokenId
        : balance.toPrimeCash().tokenId
      : balance.token.id;

    const marketYield = nonLeveragedYields.find(
      ({ token }) => token.id === maturedTokenId
    );

    // Returns accrued incentives and adjusted claimed incentives as an array
    const _incentiveEarnings: TokenBalance[] =
      balance.tokenType === 'nToken'
        ? statement?.incentives
            .map(({ adjustedClaimed }) => adjustedClaimed)
            .concat(
              accruedIncentives?.find(
                ({ currencyId }) => balance.currencyId === currencyId
              )?.incentives || []
            ) || []
        : [];

    // Reduces the array above to one entry per incentive token
    const totalIncentiveEarnings = Array.from(
      _incentiveEarnings
        .reduce((m, b) => {
          const match = m.get(b.tokenId);
          if (match) {
            m.set(match.tokenId, match.add(b));
          } else {
            m.set(b.tokenId, b);
          }
          return m;
        }, new Map<string, TokenBalance>())
        .values()
    );

    return {
      balance,
      statement,
      marketYield,
      manageTokenId,
      maturedTokenId,
      totalIncentiveEarnings,
      hasMatured: balance.hasMatured,
    };
  });

  return holdings;
}

/**
 * Calculates grouped tokens which are paired asset / debt portfolio holdings in the same currency
 */
export function calculateGroupedHoldings(
  account: AccountDefinition,
  holdings: PortfolioHolding[]
) {
  const balances =
    account?.balances.filter(
      (b) =>
        !b.isZero() &&
        !b.isVaultToken &&
        b.token.tokenType !== 'Underlying' &&
        b.token.tokenType !== 'NOTE'
    ) || [];
  const assets = balances.filter((b) => b.isPositive());
  const debts = balances.filter((b) => b.isNegative());

  return assets.reduce(
    (l, asset) => {
      const matchingDebts = debts.filter(
        (b) => b.currencyId === asset.currencyId
      );
      const matchingAssets = assets.filter(
        (b) => b.currencyId === asset.currencyId && asset.tokenType === 'nToken'
      );

      // Only creates a grouped holding if there is exactly one matching asset and debt
      if (matchingDebts.length === 1 && matchingAssets.length === 1) {
        const asset = matchingAssets[0];
        const debt = matchingDebts[0];
        const presentValue = asset.toUnderlying().add(debt.toUnderlying());
        const leverageRatio =
          debt.toUnderlying().neg().ratioWith(presentValue).toNumber() /
          RATE_PRECISION;

        // NOTE: enforce a minimum leverage ratio on these to ensure that dust balances
        // don't create leveraged positions
        if (leverageRatio > 0.05) {
          const debtHoldings = holdings.find(
            ({ balance }) => balance.tokenId === debt.tokenId
          );

          const assetHoldings = holdings.find(
            ({ balance }) => balance.tokenId === asset.tokenId
          ) as typeof holdings[number];

          l.push({
            asset: assetHoldings,
            debt: debtHoldings as PortfolioHolding,
            presentValue,
            leverageRatio,
            hasMatured: asset?.hasMatured || debt?.hasMatured ? true : false,
            borrowAPY:
              // NOTE: this accounts for matured debts and uses the variable APY after maturity
              debtHoldings?.marketYield?.token.tokenType === 'PrimeDebt'
                ? debtHoldings.marketYield.totalAPY
                : // Need to check for undefined here if the debtHoldings is undefined
                  debtHoldings?.statement?.impliedFixedRate,
          });
        }
      }

      return l;
    },
    [] as {
      asset: PortfolioHolding;
      debt: PortfolioHolding;
      presentValue: TokenBalance;
      leverageRatio: number;
      hasMatured: boolean;
      borrowAPY: number | undefined;
    }[]
  );
}

/**
 * Calculates data to display for each vault holding
 */
export function calculateVaultHoldings(account: AccountDefinition) {
  const vaultProfiles = VaultAccountRiskProfile.getAllRiskProfiles(account);
  const balanceStatements = account.balanceStatement || [];
  const allYields = Registry.getYieldRegistry().getNonLeveragedYields(
    account.network
  );

  return vaultProfiles.map((v) => {
    const debtPnL = balanceStatements.find(
      (b) => b.token.id === v.vaultDebt.tokenId
    );
    const assetPnL = balanceStatements?.find(
      (b) => b.token.id === v.vaultShares.tokenId
    );
    const cashPnL = balanceStatements?.find(
      (b) => b.token.id === v.vaultCash.tokenId
    );

    const denom = v.denom(v.defaultSymbol);
    const profit = (assetPnL?.totalProfitAndLoss || TokenBalance.zero(denom))
      .sub(debtPnL?.totalProfitAndLoss || TokenBalance.zero(denom))
      .add(cashPnL?.totalProfitAndLoss || TokenBalance.zero(denom));
    const strategyAPY =
      allYields.find((y) => v.vaultShares.tokenId === y.token.id)?.totalAPY ||
      0;
    const borrowAPY =
      debtPnL?.impliedFixedRate !== undefined
        ? debtPnL.impliedFixedRate
        : allYields.find(
            (d) => d.token.id === v.vaultDebt.unwrapVaultToken().tokenId
          )?.totalAPY || 0;

    const totalAPY = leveragedYield(
      strategyAPY,
      borrowAPY,
      v.leverageRatio() || 0
    );

    return {
      vault: v,
      liquidationPrices: v.getAllLiquidationPrices(),
      totalAPY,
      borrowAPY,
      strategyAPY,
      profit,
      denom,
    };
  });
}
