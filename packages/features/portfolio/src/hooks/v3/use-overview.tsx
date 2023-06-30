import { Registry } from '@notional-finance/core-entities';
import {
  usePortfolioRiskProfile,
  useSelectedNetwork,
  useVaultRiskProfiles,
} from '@notional-finance/notionable-hooks';

export function useOverview() {
  const network = useSelectedNetwork();
  const portfolio = usePortfolioRiskProfile();
  const vaults = useVaultRiskProfiles();
  const defaultToken = portfolio.denom(portfolio.defaultSymbol);
  const tokens = Registry.getTokenRegistry();
  const config = Registry.getConfigurationRegistry();

  const totalNetWorth = vaults.reduce((t, v) => {
    return t.add(v.netWorth().toToken(defaultToken));
  }, portfolio.netWorth());

  const totalAssets = vaults.reduce((t, v) => {
    return t.add(v.totalAssets().toToken(defaultToken));
  }, portfolio.totalAssets());

  const totalDebts = vaults.reduce((t, v) => {
    return t.add(v.totalDebt().toToken(defaultToken));
  }, portfolio.totalDebt());

  const portfolioCurrencies = network
    ? portfolio.allCurrencyIds.map((currencyId) => {
        const underlying = tokens.getUnderlying(network, currencyId);
        const totalAssets = portfolio.totalCurrencyAssets(
          currencyId,
          underlying.id
        );
        const totalDebts = portfolio.totalCurrencyAssets(
          currencyId,
          underlying.id
        );

        return {
          currency: underlying.symbol,
          totalAssets,
          totalDebts,
          netWorth: totalAssets.add(totalDebts),
        };
      })
    : [];

  const leveragedVaults = network
    ? vaults.map((v) => {
        const vaultConfig = config.getVaultConfig(network, v.vaultAddress);
        return {
          name: vaultConfig.name,
          totalAssets: v.totalAssets(),
          totalDebts: v.totalDebt(),
          netWorth: v.netWorth(),
          leverageRatio: v.leverageRatio(),
        };
      })
    : [];

  return {
    totalNetWorth,
    totalAssets,
    totalDebts,
    portfolioCurrencies,
    leveragedVaults,
  };
}
