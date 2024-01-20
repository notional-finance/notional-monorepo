import { Registry } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';

export function useInputAmount(
  selectedNetwork: Network | undefined,
  inputString: string,
  selectedToken?: string,
  suppressZero = true
) {
  if (!selectedNetwork || !selectedToken)
    return { inputAmount: undefined, token: undefined };

  const tokens = Registry.getTokenRegistry();
  const token = tokens.getTokenBySymbol(selectedNetwork, selectedToken);
  const inputAmount =
    inputString !== '' && inputString !== '.'
      ? tokens.parseInputToTokenBalance(
          inputString,
          selectedToken,
          selectedNetwork
        )
      : undefined;

  return {
    inputAmount:
      inputAmount?.isZero() && suppressZero ? undefined : inputAmount,
    token,
  };
}
