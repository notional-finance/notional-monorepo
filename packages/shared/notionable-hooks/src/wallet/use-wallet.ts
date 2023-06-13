import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
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
  token: TokenDefinition | undefined,
  inputAmount: TokenBalance | undefined
) {
  const { account } = useAccountDefinition();
  const maxBalance = token
    ? account?.balances.find((t) => t.token.id === token?.id) ||
      TokenBalance.zero(token)
    : undefined;

  const allowance = token
    ? account?.allowances?.find((a) => a.amount.tokenId === token?.id)
        ?.amount || TokenBalance.zero(token)
    : undefined;

  const insufficientBalance =
    inputAmount && maxBalance ? maxBalance.lt(inputAmount) : false;
  const insufficientAllowance =
    inputAmount && maxBalance ? allowance?.lt(inputAmount) : false;

  return {
    maxBalanceString: maxBalance?.toExactString(),
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  };
}
