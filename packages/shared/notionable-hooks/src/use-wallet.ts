import { useCallback, useEffect, useMemo } from 'react';
import {
  Allowance,
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useAccountDefinition } from './use-account';
import {
  Network,
  SupportedNetworks,
  getNetworkFromId,
} from '@notional-finance/util';
import { truncateAddress } from '@notional-finance/helpers';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Community } from '@notional-finance/notionable';
import { useWalletStore } from './context/use-root-store';
import { useSelectedNetwork } from './use-network';

export function useSubmitTxn() {
  const { submitTxn, clearTransaction } = useWalletStore();
  const selectedNetwork = useSelectedNetwork();
  const [{ wallet }] = useConnectWallet();

  useEffect(() => {
    // When the component unmounts, clear the transaction
    clearTransaction();
  }, [clearTransaction]);

  return useCallback(
    (
      transactionLabel: string,
      populatedTransaction: PopulatedTransaction,
      onTxnConfirmed?: () => void,
      expectedTokenChanges?: TokenDefinition[]
    ) => {
      if (!wallet) return;
      if (!selectedNetwork) return;
      submitTxn(
        transactionLabel,
        populatedTransaction,
        selectedNetwork,
        wallet,
        onTxnConfirmed,
        expectedTokenChanges
      );
    },
    [submitTxn, wallet, selectedNetwork]
  );
}

export function useWalletCommunities() {
  // NOTE: this is currently disabled
  return [] as Community[];
}

export function useWalletConnected() {
  return !!useWalletAddress();
}

export function useWalletAddress() {
  const { userWallet } = useWalletStore();

  return userWallet?.selectedAddress;
}

export function useWalletNetworkAccounts() {
  const walletStore = useWalletStore();

  return walletStore.isAccountPending ? undefined : walletStore.networkAccounts;
}

export function useTruncatedAddress() {
  const { userWallet } = useWalletStore();

  return userWallet?.selectedAddress
    ? truncateAddress(userWallet?.selectedAddress)
    : '';
}

export function useWalletConnectedNetwork() {
  const [{ wallet }] = useConnectWallet();
  const currentLabel = wallet?.label;
  const [{ connectedChain }] = useSetChain(currentLabel);
  const selectedChain = connectedChain?.id
    ? getNetworkFromId(BigNumber.from(connectedChain?.id).toNumber())
    : undefined;
  return selectedChain;
}

export function useReadOnlyAddress() {
  const { userWallet } = useWalletStore();
  return userWallet?.isReadOnlyAddress === true;
}

export function useWalletAllowances() {
  const networkAccounts = useWalletStore().networkAccounts;

  return SupportedNetworks.reduce((acc, n) => {
    acc[n] = networkAccounts?.get(n)?.positiveAllowances || [];
    return acc;
  }, {} as Record<Network, Allowance[]>);
}

export function useWalletBalanceInputCheck(
  token: TokenDefinition | undefined,
  inputAmount: TokenBalance | undefined
) {
  const account = useAccountDefinition(token?.network);
  const maxBalance =
    token && account
      ? account.balances.find((t) => t.token.id === token?.id) ||
        TokenBalance.zero(token)
      : undefined;

  const allowance =
    token && account
      ? account.allowances?.find((a) => a.amount.tokenId === token?.id)
          ?.amount || TokenBalance.zero(token)
      : undefined;

  const insufficientBalance =
    inputAmount && maxBalance ? maxBalance.abs().lt(inputAmount) : false;
  const insufficientAllowance =
    inputAmount && maxBalance ? allowance?.lt(inputAmount) : false;

  return {
    allowance,
    maxBalanceString: maxBalance?.toExactString(),
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  };
}

export function useWalletBalancesOnNetworks(
  networks: Network[],
  underlyingSymbol: string | undefined
) {
  const networkAccounts = useWalletStore().networkAccounts;
  if (!underlyingSymbol) return {} as Record<Network, TokenBalance>;

  return networks.reduce((acc, n) => {
    const acct =
      networkAccounts && networkAccounts[n] ? networkAccounts[n] : undefined;

    acc[n] =
      acct?.balanceOf(underlyingSymbol) ||
      getNetworkModel(n).getTokenBalanceFromSymbol(0, underlyingSymbol);

    return acc;
  }, {} as Record<Network, TokenBalance>);
}

export function useWalletBalances(
  network: Network | undefined,
  tokens: TokenDefinition[] | undefined
) {
  const account = useAccountDefinition(network);

  return useMemo(() => {
    return tokens
      ?.map((token) => {
        const maxBalance =
          token && account
            ? account.balances.find((t) => t.token.id === token?.id) ||
              TokenBalance.zero(token)
            : undefined;
        return {
          token,
          content: {
            balance: maxBalance?.isPositive()
              ? maxBalance?.toDisplayStringWithSymbol(4, true)
              : undefined,
            usdBalance: maxBalance?.isPositive()
              ? maxBalance?.toFiat('USD').toFloat()
              : undefined,
          },
        };
      })
      .sort((a, b) => {
        // Sorts descending by balance first, then by APY if balances are equal
        const balanceA = a.content.usdBalance || 0;
        const balanceB = b.content.usdBalance || 0;
        return balanceB - balanceA;
      });
  }, [tokens, account]);
}
