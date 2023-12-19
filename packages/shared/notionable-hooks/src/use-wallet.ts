import { useMemo } from 'react';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { useAccountDefinition, usePortfolioRiskProfile } from './use-account';
import { groupArrayToMap } from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useAllMarkets } from './use-market';

export function useWalletAllowances() {
  const { account } = useAccountDefinition();

  const enabledTokens =
    account?.allowances
      ?.filter((a) => a.amount.isPositive())
      .map((a) => a.amount.token) || [];
  const supportedTokens = account?.allowances?.map((a) => a.amount.token) || [];
  return { enabledTokens, supportedTokens };
}

export function useWalletBalanceInputCheck(
  token: TokenDefinition | undefined,
  inputAmount: TokenBalance | undefined
) {
  const { account } = useAccountDefinition();
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
  // create a apyData object with a type of a Record with key of string and value of string
  const apyData: Record<string, string> = {};
  const {
    yields: { fCashLend, variableLend, liquidity, fCashBorrow, variableBorrow, leveragedLiquidity },
    getMax,
    getMin,
  } = useAllMarkets();

  if(tradeType === 'LendFixed') {
    const cardData = [
      ...groupArrayToMap(fCashLend, (t) => t.underlying.symbol).entries(),
    ];
    cardData.map(([symbol, yields]) => {
      const maxRate = getMax(yields)?.totalAPY || 0;
      apyData[symbol] = `${formatNumberAsPercent(maxRate, 3)} APY`;
      return apyData;
    });
  } else if(tradeType === 'LendVariable') {
    variableLend.map(({underlying, totalAPY}) => {
      apyData[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 3)} APY`;
      return apyData;
    });
  } else if(tradeType === 'MintNToken') {
    liquidity.map(({underlying, totalAPY}) => {
      apyData[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 3)} APY`;
      return apyData;
    });
  } else if(tradeType === 'BorrowFixed') {
    const cardData = [
      ...groupArrayToMap(fCashBorrow, (t) => t.underlying.symbol).entries(),
    ];
    cardData.map(([symbol, yields]) => {
      const minRate = getMin(yields)?.totalAPY || 0;
      apyData[symbol] = `${formatNumberAsPercent(minRate, 3)} APY`;
      return apyData;
    });
  } else if(tradeType === 'BorrowVariable') {
    variableBorrow.map(({underlying, totalAPY}) => {
      apyData[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 3)} APY`;
      return apyData;
    });
  } else if(tradeType === 'LeveragedNToken') {
    leveragedLiquidity.filter((y) => y.leveraged?.debtToken.tokenType === 'PrimeDebt').map(({underlying, totalAPY}) => {
      apyData[underlying.symbol] = `${formatNumberAsPercent(totalAPY, 3)} APY`;
      return apyData;
    })
  } else {
    return apyData  
  }

  return apyData
}

export function useWalletBalances(
  tokens: TokenDefinition[] | undefined,
  tradeType: string | undefined,
) {
  const { account } = useAccountDefinition();
  const apyData = useApyValues(tradeType)
  return useMemo(() => {
    if (!account) {
      return tokens?.map((token) => {
        return {
          token,
          content: { 
            balance:  undefined, 
            apy: undefined },
        };
      });
    }
    return tokens?.map((token) => {
      const maxBalance =
        token && account
          ? account.balances.find((t) => t.token.id === token?.id) ||
            TokenBalance.zero(token)
          : undefined;
      return {
        token,
        content: { 
          balance: maxBalance?.isPositive() ? maxBalance?.toDisplayStringWithSymbol(3, true) : undefined, 
          usdBalance: maxBalance?.isPositive() ? maxBalance?.toFiat('USD').toFloat() : undefined,
          apy: apyData[token.symbol] || undefined },
      };
    }).sort((a, b) => {
      const balanceA = a.content.usdBalance;
      const balanceB = b.content.usdBalance;
      if (balanceA === undefined && balanceB === undefined) {
          return 0;
      } else if (balanceA === undefined) {
          return 1;
      } else if (balanceB === undefined) {
          return -1;
      } else {
        return balanceB - balanceA;
      }
      
  })}, [tokens, account, apyData]);
}

export function useMaxAssetBalance(token: TokenDefinition | undefined) {
  const profile = usePortfolioRiskProfile();
  return token?.tokenType === 'PrimeDebt'
    ? profile.balances
        .find(
          (b) =>
            b.tokenType === 'PrimeCash' && b.currencyId === token.currencyId
        )
        ?.toToken(token)
    : profile.balances.find((b) => b.tokenId === token?.id);
}
