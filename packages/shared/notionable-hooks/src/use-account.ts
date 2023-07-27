import { useObservableState } from 'observable-hooks';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext, useSelectedNetwork } from './use-notional';
import { EMPTY } from 'rxjs';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';

export function useAccountWithdrawableTokens() {
  const { account } = useAccountDefinition();
  return (
    account?.balances.filter((t) => t.isPositive() && !t.isVaultToken) || []
  );
}

export function useAccountDefinition() {
  const {
    globalState: { selectedNetwork, selectedAccount, isAccountReady },
  } = useNotionalContext();
  const registry = Registry.getAccountRegistry();

  const account$ =
    selectedNetwork && selectedAccount && isAccountReady
      ? registry.subscribeAccount(selectedNetwork, selectedAccount)
      : undefined;
  const account = useObservableState(account$ || EMPTY) || undefined;

  return {
    account,
    account$,
  };
}

export function useBalanceStatements() {
  const { account } = useAccountDefinition();
  return (
    account?.balanceStatement?.filter((b) => !b.currentBalance.isZero()) || []
  );
}

export function useTransactionHistory() {
  const { account } = useAccountDefinition();
  return account?.accountHistory || [];
}

export function useAccountReady() {
  const {
    globalState: { isAccountReady },
  } = useNotionalContext();
  return isAccountReady;
}

export function useBalance(selectedToken?: string) {
  const { account } = useAccountDefinition();
  return account?.balances.find((t) => t.token.symbol === selectedToken);
}

export function usePrimeCashBalance(selectedToken: string | undefined | null) {
  const selectedNetwork = useSelectedNetwork();
  const tokens = Registry.getTokenRegistry();
  const token =
    selectedToken && selectedNetwork
      ? tokens.getTokenBySymbol(selectedNetwork, selectedToken)
      : undefined;
  const primeCash =
    selectedNetwork && token?.currencyId
      ? tokens.getPrimeCash(selectedNetwork, token.currencyId)
      : undefined;

  return useBalance(primeCash?.symbol);
}

export function useVaultRiskProfiles() {
  const { account } = useAccountDefinition();

  // Groups vault positions per vault address
  const vaultPositions = account?.balances
    .filter((b) => b.isVaultToken)
    .reduce((vaults, b) => {
      const t = vaults.get(b.vaultAddress) || [];
      t.push(b);
      vaults.set(b.vaultAddress, t);
      return vaults;
    }, new Map<string, TokenBalance[]>());

  const vaultRiskProfiles: VaultAccountRiskProfile[] = [];
  vaultPositions?.forEach((balances, vaultAddress) => {
    vaultRiskProfiles.push(
      VaultAccountRiskProfile.from(vaultAddress, balances)
    );
  });

  return vaultRiskProfiles;
}

export function usePortfolioRiskProfile() {
  const { account } = useAccountDefinition();
  const network = useSelectedNetwork();

  return new AccountRiskProfile(
    account?.balances.filter(
      (b) =>
        !b.isVaultToken &&
        b.tokenType !== 'Underlying' &&
        b.tokenType !== 'NOTE'
    ) || [],
    network
  );
}
