import { useCallback, useEffect, useMemo } from 'react';
import {
  Allowance,
  getNetworkModel,
  ProductAPY,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useAccountDefinition, usePortfolioRiskProfile } from './use-account';
import {
  Network,
  RATE_PRECISION,
  SupportedNetworks,
  getNetworkFromId,
  groupArrayToMap,
} from '@notional-finance/util';
import {
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Community } from '@notional-finance/notionable';
import {
  useCurrentNetworkStore,
  useWalletStore,
} from './context/use-root-store';
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

export function usePrimeCashBalance(selectedToken: string | undefined | null) {
  const model = useCurrentNetworkStore();
  const token = selectedToken
    ? model.getTokenBySymbol(selectedToken)
    : undefined;
  const primeCash = token?.currencyId
    ? model.getPrimeCash(token.currencyId)
    : undefined;

  return useMaxAssetBalance(primeCash);
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

const getMax = (y: ProductAPY[]) => {
  return y.reduce(
    (m, t) => ((t.apy.totalAPY ?? 0) > m ? t.apy.totalAPY ?? 0 : m),
    0
  );
};

const getMin = (y: ProductAPY[]) => {
  return y.reduce(
    (m, t) => ((t.apy.totalAPY ?? 0) < m ? t.apy.totalAPY ?? 0 : m),
    RATE_PRECISION
  );
};

const getHeadlineYield = (y: ProductAPY[], isMax: boolean) => {
  return Array.from(
    groupArrayToMap(y, (t) => t?.underlying?.symbol).entries()
  ).reduce((acc, [symbol, yields]) => {
    if (symbol) {
      acc[symbol] = isMax ? getMax(yields) : getMin(yields);
    }
    return acc;
  }, {} as Record<string, number>);
};

function useApyValues(tradeType: string | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();

  if (tradeType === 'LendFixed') {
    return getHeadlineYield(currentNetworkStore.getAllFCashYields(), true);
  } else if (tradeType === 'LendVariable') {
    return getHeadlineYield(currentNetworkStore.getAllPrimeCashYields(), true);
  } else if (tradeType === 'MintNToken') {
    return getHeadlineYield(currentNetworkStore.getAllNTokenYields(), true);
  } else if (tradeType === 'BorrowFixed') {
    return getHeadlineYield(currentNetworkStore.getAllFCashDebt(), false);
  } else if (tradeType === 'BorrowVariable') {
    return getHeadlineYield(currentNetworkStore.getAllPrimeCashDebt(), false);
  } else if (tradeType === 'LeveragedNToken') {
    return getHeadlineYield(
      currentNetworkStore.getAllLeveragedNTokenYields(),
      true
    );
  } else {
    return {} as Record<string, number>;
  }
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
  tokens: TokenDefinition[] | undefined,
  tradeType: string | undefined
) {
  const account = useAccountDefinition(network);
  const apyData = useApyValues(tradeType);

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
            apyNumber: apyData[token.symbol] || 0,
            apy: `${formatNumberAsPercent(apyData[token.symbol] || 0, 2)} APY`,
          },
        };
      })
      .sort((a, b) => {
        // Sorts descending by balance first, then by APY if balances are equal
        const balanceA = a.content.usdBalance || 0;
        const balanceB = b.content.usdBalance || 0;
        if (balanceA === 0 && balanceB === 0) {
          const apyA = a.content.apyNumber || 0;
          const apyB = b.content.apyNumber || 0;
          return apyB - apyA;
        }
        return balanceB - balanceA;
      });
  }, [tokens, account, apyData]);
}

export function useMaxAssetBalance(token: TokenDefinition | undefined) {
  const profile = usePortfolioRiskProfile(token?.network);
  return token?.tokenType === 'PrimeDebt'
    ? profile?.balances
        .find(
          (b) =>
            b.tokenType === 'PrimeCash' && b.currencyId === token.currencyId
        )
        ?.toToken(token)
    : profile?.balances.find((b) => b.tokenId === token?.id);
}

export function useExceedsSupplyCap(
  deposit: TokenBalance | undefined,
  excludeSupplyCap: boolean
) {
  const currentNetworkStore = useCurrentNetworkStore();
  if (
    !excludeSupplyCap &&
    deposit?.currencyId &&
    deposit.network === currentNetworkStore.network
  ) {
    const { maxUnderlyingSupply, currentUnderlyingSupply } =
      currentNetworkStore.getMaxSupply(deposit.currencyId);

    return {
      currentUnderlyingSupply,
      maxUnderlyingSupply,
      maxDeposit: maxUnderlyingSupply.gt(currentUnderlyingSupply)
        ? maxUnderlyingSupply.sub(currentUnderlyingSupply)
        : currentUnderlyingSupply.copy(0),
      willExceedCap: currentUnderlyingSupply
        .add(deposit)
        .gt(maxUnderlyingSupply),
    };
  }

  return undefined;
}
