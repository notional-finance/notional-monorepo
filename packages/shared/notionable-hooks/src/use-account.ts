import { useObservableState } from 'observable-hooks';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext, useSelectedNetwork } from './use-notional';
import { EMPTY } from 'rxjs';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  SECONDS_IN_DAY,
  SECONDS_IN_MONTH,
  getNowSeconds,
} from '@notional-finance/util';
import { floorToMidnight } from '@notional-finance/helpers';

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
  return account?.accountHistory?.filter((h) => !h.isTransientLineItem) || [];
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
  return VaultAccountRiskProfile.getAllRiskProfiles(account?.balances || []);
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
  startTime = getNowSeconds() - SECONDS_IN_MONTH,
  endTime = getNowSeconds(),
  tickSizeInSeconds = SECONDS_IN_DAY
) {
  const { account } = useAccountDefinition();
  if (!account) return undefined;

  const allHistoricalSnapshots =
    account?.balanceStatement
      ?.flatMap((b) => b.historicalSnapshots)
      .sort((a, b) => a.timestamp - b.timestamp) || [];

  // TODO: flip this to fiat tokens
  const eth = Registry.getTokenRegistry().getTokenBySymbol(
    account.network,
    'ETH'
  );

  // Bucket the start and end time ranges
  const numBuckets = Math.ceil((endTime - startTime) / tickSizeInSeconds);
  const buckets = new Array(numBuckets)
    .fill(0)
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
          return t.add(b.balance.toToken(eth, 'None', floorToMidnight(end)));
        }, TokenBalance.zero(eth));

      const debts = snapshotsAtTime
        ?.filter(
          ({ balance }) =>
            balance.unwrapVaultToken().token.isFCashDebt === true ||
            balance.tokenType === 'PrimeDebt' ||
            balance.isNegative()
        )
        .reduce((t, b) => {
          return t.add(b.balance.toToken(eth, 'None', floorToMidnight(end)));
        }, TokenBalance.zero(eth));

      return { start, assets, debts };
    });

  return buckets;
}
