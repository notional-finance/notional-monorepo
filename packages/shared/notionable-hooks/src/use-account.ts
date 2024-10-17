import { TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext } from './use-notional';
import { Network, SEASONS, SupportedNetworks } from '@notional-finance/util';
import { useFiatToken } from './use-user-settings';
import { useState } from 'react';
import { getNowSeconds } from '@notional-finance/util';
import { useWalletStore } from '@notional-finance/notionable';

/** Contains selectors for account holdings information */
export function useNetworkAccounts(network: Network | undefined) {
  const walletStore = useWalletStore();
  return network ? walletStore.networkAccounts.get(network) : undefined;
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
  return useVaultHoldings(network).find((v) => v.vaultAddress === vaultAddress);
}

export function usePortfolioHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.detailedHoldings || [];
}

export function useGroupedHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.groupedHoldings || [];
}

export function usePortfolioRiskProfile(network: Network | undefined) {
  return useNetworkAccounts(network)?.getAccountRiskProfile();
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

export function useTotalArbPoints() {
  const [totalPoints, _] = useState<{
    [SEASONS.SEASON_ONE]: number;
    [SEASONS.SEASON_TWO]: number;
    [SEASONS.SEASON_THREE]: number;
  }>({
    [SEASONS.SEASON_ONE]: 0,
    [SEASONS.SEASON_TWO]: 0,
    [SEASONS.SEASON_THREE]: 0,
  });
  return totalPoints;
}

export function useCurrentSeason() {
  const now = getNowSeconds();
  if (now < PointsSeasonsData[SEASONS.SEASON_ONE].endDate.getTime() / 1000) {
    return PointsSeasonsData[SEASONS.SEASON_ONE];
  } else if (
    now <
    PointsSeasonsData[SEASONS.SEASON_TWO].endDate.getTime() / 1000
  ) {
    return PointsSeasonsData[SEASONS.SEASON_TWO];
  } else {
    return PointsSeasonsData[SEASONS.SEASON_THREE];
  }
}
