import { AccountData } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import {
  accountState$,
  initialAccountState,
  setReadOnlyAddress,
} from '@notional-finance/notionable';
import { truncateAddress } from '@notional-finance/helpers';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext, useSelectedNetwork } from '../use-notional';
import { EMPTY } from 'rxjs';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';

export function useAccount() {
  const {
    account,
    balanceSummary,
    assetSummary,
    noteSummary,
    accountConnected,
    isReadOnly,
    readOnlyAddress,
    accountSummariesLoaded,
    lastUpdateTime,
  } = useObservableState(accountState$, initialAccountState);

  const truncatedAddress = account?.address
    ? truncateAddress(account?.address)
    : '';

  return {
    account,
    accountDataCopy: AccountData.copyAccountData(account?.accountData),
    address: account?.address,
    truncatedAddress: truncatedAddress,
    accountSummariesLoaded,
    // account connected returns true when the account has been loaded
    accountConnected,
    balanceSummary,
    assetSummary,
    noteSummary,
    isReadOnly,
    readOnlyAddress,
    setReadOnlyAddress,
    lastUpdateTime,
  };
}
export function useAccountWithdrawableTokens() {
  // NOTE: any token with prime debt enabled is always "withdrawable"
  const { balanceSummary } = useAccount();

  return Array.from(balanceSummary.values())
    .filter((b) => b.isWithdrawable)
    .flatMap((b) => {
      return [b.underlyingSymbol, b.symbol];
    })
    .filter((s) => s !== undefined);
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
  const primeCash = selectedNetwork
    ? tokens.getPrimeCash(selectedNetwork, token?.currencyId)
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

  return AccountRiskProfile.from(
    account?.balances.filter(
      (b) =>
        !b.isVaultToken &&
        b.tokenType !== 'Underlying' &&
        b.tokenType !== 'NOTE'
    ) || []
  );
}
