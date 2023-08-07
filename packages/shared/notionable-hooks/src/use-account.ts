import { useObservableState } from 'observable-hooks';
import {
  FiatKeys,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { useNotionalContext, useSelectedNetwork } from './use-notional';
import { EMPTY } from 'rxjs';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  Network,
  SECONDS_IN_QUARTER,
  SECONDS_IN_WEEK,
  getNowSeconds,
} from '@notional-finance/util';

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

export function useVaultRiskProfile(vaultAddress?: string) {
  const { account } = useAccountDefinition();
  const vaultBalances = account?.balances.filter(
    (b) => b.token.vaultAddress === vaultAddress
  );

  if (vaultAddress && vaultBalances?.length) {
    return VaultAccountRiskProfile.from(vaultAddress, vaultBalances);
  }

  return undefined;
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

export function useAccountHistoryChart(
  fiatToken: FiatKeys = 'USD',
  startTime = getNowSeconds() - SECONDS_IN_QUARTER,
  endTime = getNowSeconds(),
  tickSizeInSeconds = SECONDS_IN_WEEK
) {
  const { account } = useAccountDefinition();

  const allHistoricalSnapshots =
    account?.balanceStatement
      ?.flatMap((b) => b.historicalSnapshots)
      .sort((a, b) => a.timestamp - b.timestamp) || [];

  const base = Registry.getTokenRegistry().getTokenBySymbol(
    Network.All,
    fiatToken
  );

  // Bucket the start and end time ranges
  const numBuckets = Math.ceil((endTime - startTime) / tickSizeInSeconds);
  const buckets = new Array(numBuckets)
    .map((_, i) => {
      const start = startTime + i * tickSizeInSeconds;
      return { start, end: start + tickSizeInSeconds };
    })
    .map(({ start, end }) => {
      const snapshotsAtTime = Array.from(
        allHistoricalSnapshots
          .filter(({ timestamp }) => timestamp < end)
          .reduce((t, s) => {
            // This will always set the token id key to the latest snapshot value, preserving
            // the previous snapshot value if there was no update in this time block
            t.set(s.balance.tokenId, s);
            return t;
          }, new Map<string, typeof allHistoricalSnapshots[number]>())
          .values()
      );

      const assets = snapshotsAtTime
        ?.filter(
          ({ balance }) =>
            !(
              balance.unwrapVaultToken().token.isFCashDebt === true ||
              balance.tokenType === 'PrimeDebt' ||
              balance.isNegative()
            )
        )
        .reduce((t, b) => {
          // TODO: switch this to "toFiatAtTimestamp"
          return t.add(b.balance.toFiat(fiatToken));
        }, TokenBalance.zero(base));

      const debts = snapshotsAtTime
        ?.filter(
          ({ balance }) =>
            balance.unwrapVaultToken().token.isFCashDebt === true ||
            balance.tokenType === 'PrimeDebt' ||
            balance.isNegative()
        )
        .reduce((t, b) => {
          // TODO: switch this to "toFiatAtTimestamp"
          return t.add(b.balance.toFiat(fiatToken));
        }, TokenBalance.zero(base));

      return { start, assets, debts };
    });

  return buckets;
}
