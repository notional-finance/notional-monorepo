import { useMemo } from 'react';
import {
  Allowance,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useAccountDefinition, usePortfolioRiskProfile } from './use-account';
import {
  Network,
  SupportedNetworks,
  groupArrayToMap,
} from '@notional-finance/util';
import {
  formatNumberAsPercent,
  truncateAddress,
} from '@notional-finance/helpers';
import { useAllMarkets } from './use-market';
import { useNotionalContext } from './use-notional';

export function usePrimeCashBalance(
  selectedToken: string | undefined | null,
  selectedNetwork: Network | undefined
) {
  const tokens = Registry.getTokenRegistry();
  const token = useMemo(() => 
    selectedToken && selectedNetwork
      ? tokens.getTokenBySymbol(selectedNetwork, selectedToken)
      : undefined,
    [selectedToken, selectedNetwork, tokens]
  );
  const primeCash = useMemo(() =>
    selectedNetwork && token?.currencyId
      ? tokens.getPrimeCash(selectedNetwork, token.currencyId)
      : undefined,
    [selectedNetwork, token, tokens]
  );

  return useMaxAssetBalance(primeCash);
}

export function useWalletCommunities() {
  const {
    globalState: { communityMembership },
  } = useNotionalContext();
  const community = useMemo(() => communityMembership, [communityMembership]);
  return community;
}

export function useWalletConnected() {
  return !!useWalletAddress();
}

export function useWalletAddress() {
  const {
    globalState: { wallet },
  } = useNotionalContext();

  const selectedAddress = useMemo(() => wallet?.selectedAddress, [wallet?.selectedAddress]);
  return selectedAddress;
}

export function useTruncatedAddress() {
  const {
    globalState: { wallet },
  } = useNotionalContext();
  
    const selectedAddress = useMemo(() => wallet?.selectedAddress, [wallet?.selectedAddress]);
    return selectedAddress  ? truncateAddress(selectedAddress)
    : '';
}

export function useWalletConnectedNetwork() {
  const {
    globalState: { wallet },
  } = useNotionalContext();
  const selectedWallet = useMemo(() => wallet?.selectedChain, [wallet?.selectedChain]);
  return selectedWallet;
}

export function useReadOnlyAddress() {
  const {
    globalState: { wallet },
  } = useNotionalContext();
  return wallet?.isReadOnlyAddress === true;
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
  const maxBalance = useMemo(() =>
    token && account
      ? account.balances.find((t) => t.token.id === token?.id) ||
        TokenBalance.zero(token)
      : undefined,
    [token, account]
  );

  const allowance = useMemo(() =>
    token && account
      ? account.allowances?.find((a) => a.amount.tokenId === token?.id)
          ?.amount || TokenBalance.zero(token)
      : undefined,
    [token, account]
  );

  const insufficientBalance = useMemo(() =>
    inputAmount && maxBalance ? maxBalance.abs().lt(inputAmount) : false,
    [inputAmount, maxBalance]
  );

  const insufficientAllowance = useMemo(() =>
    inputAmount && maxBalance ? allowance?.lt(inputAmount) : false,
    [inputAmount, maxBalance, allowance]
  );

  return useMemo(() => ({
    allowance,
    maxBalanceString: maxBalance?.toExactString(),
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  }), [allowance, maxBalance, insufficientBalance, insufficientAllowance]);
}

function useApyValues(
  tradeType: string | undefined,
  network: Network | undefined
) {
  const {
    yields: {
      fCashLend,
      variableLend,
      liquidity,
      fCashBorrow,
      variableBorrow,
      leveragedLiquidity,
    },
    getMax,
    getMin,
  } = useAllMarkets(network);

  const apyData = useMemo(() => {
    const data: Record<string, string> = {};

    if (tradeType === 'LendFixed') {
      const cardData = [
        ...groupArrayToMap(fCashLend, (t) => t.underlying.symbol).entries(),
      ];
      cardData.forEach(([symbol, yields]) => {
        const maxRate = getMax(yields)?.totalAPY || 0;
        data[symbol] = `${formatNumberAsPercent(maxRate, 2)} APY`;
      });
    } else if (tradeType === 'LendVariable') {
      variableLend.forEach(({ underlying, totalAPY }) => {
        data[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 2)} APY`;
      });
    } else if (tradeType === 'MintNToken') {
      liquidity.forEach(({ underlying, totalAPY }) => {
        data[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 2)} APY`;
      });
    } else if (tradeType === 'BorrowFixed') {
      const cardData = [
        ...groupArrayToMap(fCashBorrow, (t) => t.underlying.symbol).entries(),
      ];
      cardData.forEach(([symbol, yields]) => {
        const minRate = getMin(yields)?.totalAPY || 0;
        data[symbol] = `${formatNumberAsPercent(minRate, 2)} APY`;
      });
    } else if (tradeType === 'BorrowVariable') {
      variableBorrow.forEach(({ underlying, totalAPY }) => {
        data[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 2)} APY`;
      });
    } else if (tradeType === 'LeveragedNToken') {
      leveragedLiquidity
        .filter((y) => y.leveraged?.debtToken.tokenType === 'PrimeDebt')
        .forEach(({ underlying, totalAPY }) => {
          data[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 2)} APY`;
        });
    }

    return data;
  }, [
    tradeType,
    fCashLend,
    variableLend,
    liquidity,
    fCashBorrow,
    variableBorrow,
    leveragedLiquidity,
    getMax,
    getMin,
  ]);

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
      ) || TokenBalance.fromSymbol(0, underlyingSymbol, n);

    return acc;
  }, {} as Record<Network, TokenBalance>);
}

export function useWalletBalances(
  network: Network | undefined,
  tokens: TokenDefinition[] | undefined,
  tradeType: string | undefined
) {
  const account = useAccountDefinition(network);
  const apyData = useApyValues(tradeType, network);
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

export function useExceedsSupplyCap(deposit: TokenBalance | undefined, excludeSupplyCap: boolean) {
  if (deposit && !excludeSupplyCap) {
    const { maxUnderlyingSupply, currentUnderlyingSupply } =
      Registry.getConfigurationRegistry().getMaxSupply(
        deposit?.network,
        deposit?.currencyId
      );

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
