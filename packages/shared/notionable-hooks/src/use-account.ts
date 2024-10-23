import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { Network, SEASONS, SupportedNetworks } from '@notional-finance/util';
import { useFiatToken } from './use-user-settings';
import { useState } from 'react';
import { getNowSeconds } from '@notional-finance/util';
import { useWalletStore } from '@notional-finance/notionable';
import { useSelectedNetwork } from './use-network';
import { useObserver } from 'mobx-react-lite';

/** Contains selectors for account holdings information */
function useNetworkAccounts(network: Network | undefined) {
  const walletStore = useWalletStore();
  return network ? walletStore.networkAccounts.get(network) : undefined;
}

export function useCurrentNetworkAccount() {
  const network = useSelectedNetwork();
  return useNetworkAccounts(network);
}

/** Total NOTE balances across all networks */
export function useTotalNOTEBalances() {
  const walletStore = useWalletStore();

  if (walletStore.networkAccounts) {
    return SupportedNetworks.reduce((t, n) => {
      const note = walletStore.networkAccounts
        .get(n)
        ?.balances.find((t) => t.symbol === 'NOTE');
      return t + (note?.toFloat() || 0);
    }, 0);
  }

  return undefined;
}

export function useAccountDefinition(network: Network | undefined) {
  const walletStore = useWalletStore();
  const account = useObserver(() =>
    network && walletStore.networkAccounts
      ? walletStore.networkAccounts.get(network)
      : undefined
  );

  return account;
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
  const walletStore = useWalletStore();
  return walletStore.isAccountPending;
}

export function useTransactionHistory(network: Network | undefined) {
  const account = useAccountDefinition(network);
  return account?.accountHistory?.filter((h) => !h.isTransientLineItem) || [];
}

export function useVaultHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.vaultHoldings;
}

export function useTotalVaultHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.totalVaultHoldings;
}

export function useVaultPosition(
  network: Network | undefined,
  vaultAddress: string | undefined
) {
  return useVaultHoldings(network)?.find(
    (v) => v.vaultAddress === vaultAddress
  );
}

export function useTotalPortfolioHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.totalPortfolioHoldings;
}

export function usePortfolioHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.detailedHoldings;
}

export function useGroupedHoldings(network: Network | undefined) {
  return useNetworkAccounts(network)?.groupedHoldings;
}

export function usePortfolioRiskProfile(network: Network | undefined) {
  return useNetworkAccounts(network)?.portfolioRiskProfile;
}

export function usePortfolioMaxWithdraw(token: TokenDefinition | undefined) {
  const networkAccounts = useNetworkAccounts(token?.network);
  return networkAccounts && token
    ? networkAccounts.maxPortfolioWithdraw(token)
    : undefined;
}

export function useVaultMaxWithdraw(
  network: Network | undefined,
  vaultAddress: string | undefined
) {
  const networkAccounts = useNetworkAccounts(network);
  return networkAccounts && vaultAddress
    ? networkAccounts.maxVaultWithdraw(vaultAddress)
    : undefined;
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
  const walletStore = useWalletStore();

  return SupportedNetworks.reduce((acc, n) => {
    if (walletStore.networkAccounts && walletStore.networkAccounts.get(n)) {
      acc[n] =
        walletStore.networkAccounts.get(n)?.currentFactors?.netWorth ||
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

export const PointsSeasonsData = {
  [SEASONS.SEASON_ONE]: {
    name: 'Season One',
    db_name: SEASONS.SEASON_ONE,
    startDate: new Date(2024, 5, 24),
    endDate: new Date(2024, 6, 22),
    totalArb: 55_000,
    totalPoints: '',
  },
  [SEASONS.SEASON_TWO]: {
    name: 'Season Two',
    db_name: SEASONS.SEASON_TWO,
    startDate: new Date(2024, 6, 23),
    endDate: new Date(2024, 7, 19),
    totalArb: 60_000,
    totalPoints: '',
  },
  [SEASONS.SEASON_THREE]: {
    name: 'Season Three',
    db_name: SEASONS.SEASON_THREE,
    startDate: new Date(2024, 7, 20),
    endDate: new Date(2024, 8, 16),
    totalArb: 60_000,
    totalPoints: '',
  },
};
