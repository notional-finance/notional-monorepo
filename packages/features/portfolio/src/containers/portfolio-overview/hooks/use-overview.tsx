import {
  usePortfolioRiskProfile,
  useVaultRiskProfiles,
} from '@notional-finance/notionable-hooks';

export function useOverview() {
  const portfolio = usePortfolioRiskProfile();
  const vaults = useVaultRiskProfiles();
  const defaultToken = portfolio.denom(portfolio.defaultSymbol);

  const totalNetWorth = vaults.reduce((t, v) => {
    return t.add(v.netWorth().toToken(defaultToken));
  }, portfolio.netWorth());

  const totalAssets = vaults.reduce((t, v) => {
    return t.add(v.totalAssets().toToken(defaultToken));
  }, portfolio.totalAssets());

  const totalDebts = vaults.reduce((t, v) => {
    return t.add(v.totalDebt().toToken(defaultToken));
  }, portfolio.totalDebt());

  return {
    totalNetWorth,
    totalAssets,
    totalDebts,
  };
}
