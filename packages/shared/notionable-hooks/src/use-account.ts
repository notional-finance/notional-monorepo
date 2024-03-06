import { TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext } from './use-notional';
import { Network, SupportedNetworks } from '@notional-finance/util';
import { useFiatToken } from './use-user-settings';

/** Contains selectors for account holdings information */

export function useAccountDefinition(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  const account =
    network && networkAccounts ? networkAccounts[network] : undefined;

  return account?.accountDefinition;
}

export function useTotalIncentives(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();

  return networkAccounts && network
    ? networkAccounts[network].totalIncentives || {}
    : {};
}

export function useAccountReady(network: Network | undefined) {
  return useAccountDefinition(network) !== undefined;
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
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].vaultHoldings || []
    : [];
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
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].portfolioHoldings || []
    : [];
}

export function useGroupedHoldings(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].groupedHoldings || []
    : undefined;
}

export function usePortfolioRiskProfile(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].riskProfile
    : undefined;
}

export function usePortfolioLiquidationPrices(network: Network | undefined) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return networkAccounts && network
    ? networkAccounts[network].portfolioLiquidationPrices || []
    : [];
}

export function useAccountCurrentFactors(network: Network | undefined) {
  const fiatToken = useFiatToken();
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  const emptyFactors = {
    currentAPY: undefined,
    netWorth: TokenBalance.zero(fiatToken),
    debts: TokenBalance.zero(fiatToken),
    assets: TokenBalance.zero(fiatToken),
  };

  if (
    networkAccounts &&
    network &&
    networkAccounts[network] &&
    networkAccounts[network].currentFactors
  ) {
    return networkAccounts[network].currentFactors || emptyFactors;
  } else {
    return emptyFactors;
  }
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
