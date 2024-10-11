import { useCallback, useMemo } from 'react';
import {
  Allowance,
  getNetworkModel,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useAccountDefinition, usePortfolioRiskProfile } from './use-account';
import {
  Network,
  SupportedNetworks,
  getNetworkFromId,
  groupArrayToMap,
} from '@notional-finance/util';
import {
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { useNotionalContext } from './use-notional';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BigNumber } from 'ethers';
import {
  useCurrentNetworkStore,
  useWalletStore,
} from '@notional-finance/notionable';

export function usePrimeCashBalance(
  selectedToken: string | undefined | null,
  selectedNetwork: Network | undefined
) {
  const tokens = Registry.getTokenRegistry();
  const token =
    selectedToken && selectedNetwork
      ? tokens.getTokenBySymbol(selectedNetwork, selectedToken)
      : undefined;
  const primeCash =
    selectedNetwork && token?.currencyId
      ? tokens.getPrimeCash(selectedNetwork, token.currencyId)
      : undefined;

  return useMaxAssetBalance(primeCash);
}

export function useWalletCommunities() {
  const {
    globalState: { communityMembership },
  } = useNotionalContext();

  return communityMembership;
}

export function useWalletConnected() {
  return !!useWalletAddress();
}

export function useWalletAddress() {
  const { userWallet } = useWalletStore();

  return userWallet?.selectedAddress;
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
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  return SupportedNetworks.reduce((acc, n) => {
    acc[n as Network] =
      networkAccounts && networkAccounts[n as Network]
        ? networkAccounts[n as Network].accountDefinition?.allowances?.filter(
            (a) => a.amount.isPositive() && a.amount.symbol !== 'ETH'
          ) || []
        : [];
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

function useApyValues(tradeType: string | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  // create a apyData object with a type of a Record with key of string and value of string
  const apyData: Record<string, string> = {};

  const getMax = useCallback((y: any[]) => {
    return y.reduce((m, t) => (m === null || t.totalAPY > m.totalAPY ? t : m));
  }, []);

  const getMin = useCallback((y: any[]) => {
    return y.reduce((m, t) => (m === null || t.totalAPY < m.totalAPY ? t : m));
  }, []);

  if (tradeType === 'LendFixed') {
    const fCashLend = currentNetworkStore.getAllFCashYields();
    const cardData = [
      ...groupArrayToMap(fCashLend, (t) => t?.underlying?.symbol).entries(),
    ];
    cardData.map(([symbol, yields]) => {
      const indexSymbol = symbol ? symbol : '';
      const maxRate = getMax(yields)?.totalAPY || 0;
      apyData[indexSymbol] = `${formatNumberAsPercent(maxRate, 2)} APY`;
      return apyData;
    });
  } else if (tradeType === 'LendVariable') {
    const variableLend = currentNetworkStore.getAllPrimeCashYields();
    variableLend.map(({ underlying, apy }) => {
      const indexSymbol = underlying?.symbol ? underlying?.symbol : '';
      apyData[indexSymbol] = `${formatNumberAsPercent(
        apy?.totalAPY || 0,
        2
      )} APY`;
      return apyData;
    });
  } else if (tradeType === 'MintNToken') {
    const liquidity = currentNetworkStore.getAllNTokenYields();
    liquidity.map(({ underlying, apy }) => {
      const indexSymbol = underlying?.symbol ? underlying?.symbol : '';
      apyData[indexSymbol] = `${formatNumberAsPercent(
        apy?.totalAPY || 0,
        2
      )} APY`;
      return apyData;
    });
  } else if (tradeType === 'BorrowFixed') {
    const fCashBorrow = currentNetworkStore.getAllFCashDebt();
    const cardData = [
      ...groupArrayToMap(fCashBorrow, (t) => t?.underlying?.symbol).entries(),
    ];
    cardData.map(([symbol, yields]) => {
      const indexSymbol = symbol ? symbol : '';
      const minRate = getMin(yields)?.totalAPY || 0;
      apyData[indexSymbol] = `${formatNumberAsPercent(minRate, 2)} APY`;
      return apyData;
    });
  } else if (tradeType === 'BorrowVariable') {
    const variableBorrow = currentNetworkStore.getAllPrimeCashDebt();
    variableBorrow.map(({ underlying, apy }) => {
      const indexSymbol = underlying?.symbol ? underlying?.symbol : '';
      apyData[indexSymbol] = `${formatNumberAsPercent(
        apy?.totalAPY || 0,
        2
      )} APY`;
      return apyData;
    });
  } else if (tradeType === 'LeveragedNToken') {
    const leveragedLiquidity =
      currentNetworkStore.getAllLeveragedNTokenYields();
    leveragedLiquidity
      .filter((y) => y?.debtToken?.tokenType === 'PrimeDebt')
      .map(({ underlying, apy }) => {
        const indexSymbol = underlying?.symbol ? underlying?.symbol : '';
        apyData[indexSymbol] = `${formatNumberAsPercent(
          apy?.totalAPY || 0,
          2
        )} APY`;
        return apyData;
      });
  } else {
    return apyData;
  }

  return apyData;
}

export function useWalletBalancesOnNetworks(
  networks: Network[],
  underlyingSymbol: string | undefined
) {
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  if (!underlyingSymbol) return {} as Record<Network, TokenBalance>;

  return networks.reduce((acc, n) => {
    const acct =
      networkAccounts && networkAccounts[n] ? networkAccounts[n] : undefined;

    acc[n] =
      acct?.accountDefinition?.balances.find(
        (t) => t.tokenType === 'Underlying' && t.symbol === underlyingSymbol
      ) || getNetworkModel(n).getTokenBalanceFromSymbol(0, underlyingSymbol);

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
            apy: apyData[token.symbol] || undefined,
          },
        };
      })
      .sort((a, b) => {
        // Sorts descending
        const balanceA = a.content.usdBalance || 0;
        const balanceB = b.content.usdBalance || 0;
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
  if (deposit?.currencyId && !excludeSupplyCap) {
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
