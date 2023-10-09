import { useObservableState } from 'observable-hooks';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useNotionalContext, useSelectedNetwork } from './use-notional';
import { EMPTY } from 'rxjs';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { truncateAddress } from '@notional-finance/helpers';
import { convertToSignedfCashId, leveragedYield } from '@notional-finance/util';
import { useAllMarkets } from './use-market';
import { usePendingPnLCalculation } from './use-transaction';
import { useMemo } from 'react';

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

export function useTruncatedAddress() {
  const {
    globalState: { selectedAccount, isAccountReady },
  } = useNotionalContext();
  return selectedAccount && isAccountReady
    ? truncateAddress(selectedAccount)
    : '';
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
  if (vaultAddress && account) {
    return VaultAccountRiskProfile.fromAccount(vaultAddress, account);
  }

  return undefined;
}

export function useVaultRiskProfiles() {
  const { account } = useAccountDefinition();
  return account ? VaultAccountRiskProfile.getAllRiskProfiles(account) : [];
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

export function useHoldings() {
  const { account } = useAccountDefinition();
  const balanceStatements = useBalanceStatements();
  const { nonLeveragedYields } = useAllMarkets();
  const { pendingTokens } = usePendingPnLCalculation();

  return useMemo(
    () =>
      account?.balances
        .filter(
          (b) =>
            !b.isZero() &&
            !b.isVaultToken &&
            b.token.tokenType !== 'Underlying' &&
            b.token.tokenType !== 'NOTE'
        )
        .sort((a, b) => a.currencyId - b.currencyId)
        .map((balance) => {
          const statement = balanceStatements.find(
            (s) =>
              s.token.id ===
              convertToSignedfCashId(balance.tokenId, balance.isNegative())
          );
          const maturedTokenId = balance.hasMatured
            ? balance.isPositive()
              ? balance.toPrimeCash().tokenId
              : balance.toPrimeDebt().tokenId
            : balance.token.id;

          const marketYield = nonLeveragedYields.find(
            ({ token }) => token.id === maturedTokenId
          );

          const manageTokenId = balance.hasMatured
            ? balance.isPositive()
              ? balance.toPrimeDebt().tokenId
              : balance.toPrimeCash().tokenId
            : balance.token.id;

          const isPending = pendingTokens.find((t) => t.id === balance.tokenId);

          return {
            balance,
            statement,
            marketYield,
            manageTokenId,
            maturedTokenId,
            isPending,
          };
        }) || [],
    [pendingTokens, account, balanceStatements, nonLeveragedYields]
  );
}

export function useVaultHoldings() {
  const vaults = useVaultRiskProfiles();
  const balanceStatements = useBalanceStatements();
  const { pendingTokens } = usePendingPnLCalculation();
  const {
    yields: { variableBorrow, vaultShares },
  } = useAllMarkets();

  return useMemo(
    () =>
      vaults.map((v) => {
        const debtPnL = balanceStatements.find(
          (b) => b.token.id === v.vaultDebt.tokenId
        );
        const assetPnL = balanceStatements?.find(
          (b) => b.token.id === v.vaultShares.tokenId
        );
        const cashPnL = balanceStatements?.find(
          (b) => b.token.id === v.vaultCash.tokenId
        );
        const isPending = pendingTokens.find(
          (t) => t.id === v.vaultShares.tokenId
        );
        const denom = v.denom(v.defaultSymbol);
        const profit = (
          assetPnL?.totalProfitAndLoss || TokenBalance.zero(denom)
        )
          .sub(debtPnL?.totalProfitAndLoss || TokenBalance.zero(denom))
          .add(cashPnL?.totalProfitAndLoss || TokenBalance.zero(denom));
        const strategyAPY =
          vaultShares.find((y) => y.token.vaultAddress === v.vaultAddress)
            ?.totalAPY || 0;
        const borrowAPY =
          debtPnL?.impliedFixedRate !== undefined
            ? debtPnL.impliedFixedRate
            : variableBorrow.find(
                (d) => d.token.id === v.vaultDebt.unwrapVaultToken().tokenId
              )?.totalAPY || 0;

        const totalAPY = leveragedYield(
          strategyAPY,
          borrowAPY,
          v.leverageRatio() || 0
        );

        return {
          vault: v,
          totalAPY,
          borrowAPY,
          strategyAPY,
          profit,
          isPending,
          denom,
        };
      }),
    [vaults, balanceStatements, pendingTokens, vaultShares, variableBorrow]
  );
}
