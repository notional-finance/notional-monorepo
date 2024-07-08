import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext } from './use-notional';
import { Network, SupportedNetworks } from '@notional-finance/util';
import { useFiatToken } from './use-user-settings';
import { useEffect, useState } from 'react';

/** Contains selectors for account holdings information */
function useNetworkAccounts(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  return network && networkAccounts && networkAccounts[network];
}

/** Total NOTE balances across all networks */
export function useTotalNOTEBalances() {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  if (networkAccounts) {
    return SupportedNetworks.reduce((t, n) => {
      const note = networkAccounts[n]?.accountDefinition?.balances.find(
        (t) => t.symbol === 'NOTE'
      );
      return t + (note?.toFloat() || 0);
    }, 0);
  }

  return undefined;
}

export function useAccountDefinition(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  const account =
    network && networkAccounts ? networkAccounts[network] : undefined;

  return account?.accountDefinition;
}

export function useTotalIncentives(network: Network | undefined) {
  return useNetworkAccounts(network)?.totalIncentives || {};
}

export function useAccountReady(network: Network | undefined) {
  return useAccountDefinition(network) !== undefined;
}

export function useAccountAndBalanceReady(network: Network | undefined) {
  const isAccountReady = useAccountReady(network);
  const accountNetWorth = useAccountNetWorth();
  const hasNotionalBalance = SupportedNetworks.find(
    (network) => !accountNetWorth[network].isZero()
  );
  return isAccountReady && hasNotionalBalance;
}

export function useAccountLoading() {
  const {
    globalState: { isAccountPending },
  } = useNotionalContext();
  return isAccountPending;
}

export function useTransactionHistory(network: Network | undefined) {
  const account = useAccountDefinition(network);
  return account?.accountHistory?.filter((h) => !h.isTransientLineItem) || [];
}

export function useVaultHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.vaultHoldings || [];
}

export function useVaultPosition(
  network: Network | undefined,
  vaultAddress: string | undefined
) {
  return useVaultHoldings(network).find(
    ({ vault }) => vault.vaultAddress === vaultAddress
  );
}

export function usePortfolioHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.portfolioHoldings || [];
}

export function useGroupedHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.groupedHoldings || [];
}

export function usePortfolioRiskProfile(network: Network | undefined) {
  return useNetworkAccounts(network)?.riskProfile;
}

export function usePortfolioLiquidationPrices(network: Network | undefined) {
  return useNetworkAccounts(network)?.portfolioLiquidationPrices || [];
}

export function useAccountCurrentFactors(network: Network | undefined) {
  const fiatToken = useFiatToken();
  const emptyFactors = {
    currentAPY: undefined,
    netWorth: TokenBalance.zero(fiatToken),
    debts: TokenBalance.zero(fiatToken),
    assets: TokenBalance.zero(fiatToken),
  };

  return useNetworkAccounts(network)?.currentFactors || emptyFactors;
}

export function useAccountNetWorth() {
  const fiatToken = useFiatToken();
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  return SupportedNetworks.reduce((acc, n) => {
    if (networkAccounts && networkAccounts[n]) {
      acc[n] =
        networkAccounts[n].currentFactors?.netWorth ||
        TokenBalance.zero(fiatToken);
    } else {
      acc[n] = TokenBalance.zero(fiatToken);
    }
    return acc;
  }, {} as Record<Network, TokenBalance>);
}

export function useArbPoints() {
  const {
    globalState: { arbPoints },
  } = useNotionalContext();

  return arbPoints;
}

export function useTotalArbPoints() {
  const [totalPoints, setTotalPoints] = useState<{
    season_one: number;
    season_two: number;
    season_three: number;
  }>({ season_one: 0, season_two: 0, season_three: 0 });
  useEffect(() => {
    Registry.getAnalyticsRegistry().getTotalPoints().then(setTotalPoints);
  }, []);

  return totalPoints;
}

export function useAccountTotalPointsPerDay() {
  return useNetworkAccounts(Network.arbitrum)?.pointsPerDay || 0;
}
