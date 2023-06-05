import { TokenBalance } from '@notional-finance/core-entities';
import { useAccountDefinition } from '../account/use-account';

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
  inputAmount: TokenBalance | undefined
) {
  const { account } = useAccountDefinition();
  if (!account || !inputAmount) {
    return {
      maxBalanceString: undefined,
      maxBalance: undefined,
      insufficientBalance: false,
      insufficientAllowance: false,
    };
  }

  const maxBalance =
    account.balances.find((t) => t.token.id === inputAmount.tokenId) ||
    inputAmount.copy(0);

  const allowance =
    account.allowances?.find((a) => a.amount.tokenId === inputAmount.tokenId)
      ?.amount || inputAmount.copy(0);

  const insufficientBalance = maxBalance.lt(inputAmount);
  const insufficientAllowance = allowance.lt(inputAmount);

  return {
    maxBalanceString: maxBalance?.toExactString(),
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  };
}
