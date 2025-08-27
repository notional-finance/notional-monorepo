import { TokenBalance } from '@notional-finance/core-entities';
import { Network, SupportedNetworks } from '@notional-finance/util';
import { useFiatToken } from './use-user-settings';
import { useWalletStore } from './context/use-root-store';
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

export function useAccountHasPositions() {
  const walletStore = useWalletStore();
  return SupportedNetworks.filter((n) => {
    const hasPosition = walletStore.networkAccounts
      .get(n)
      ?.balances.some((t) => t.tokenType === 'VaultShare' && !t.isZero());
    return hasPosition;
  });
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

export function useAccountReady(network: Network | undefined) {
  return useAccountDefinition(network) !== undefined;
}

export function useAccountLoading() {
  const walletStore = useWalletStore();
  return walletStore.isAccountPending;
}

export function useTransactionHistory(network: Network | undefined) {
  return useAccountDefinition(network)?.accountHistory;
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

export function useVaultMaxWithdraw(
  network: Network | undefined,
  vaultAddress: string | undefined
) {
  const networkAccounts = useNetworkAccounts(network);
  return networkAccounts && vaultAddress
    ? networkAccounts.maxVaultWithdraw(vaultAddress)
    : undefined;
}

export function useAccountCurrentFactors(network: Network | undefined) {
  return useNetworkAccounts(network)?.currentFactors;
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
