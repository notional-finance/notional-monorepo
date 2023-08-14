import { Registry } from '@notional-finance/core-entities';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export function useInputAmount(
  inputString: string,
  selectedToken?: string,
  suppressZero = true
) {
  const selectedNetwork = useSelectedNetwork();
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
