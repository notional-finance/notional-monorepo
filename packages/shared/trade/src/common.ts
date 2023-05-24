import { Registry } from '@notional-finance/core-entities';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export function useInputAmount(inputString: string, selectedToken: string) {
  const selectedNetwork = useSelectedNetwork();
  const tokens = Registry.getTokenRegistry();
  const token = tokens.getTokenBySymbol(selectedNetwork, selectedToken);

  return {
    inputAmount:
      inputString !== ''
        ? tokens.parseInputToTokenBalance(
            inputString,
            selectedToken,
            selectedNetwork
          )
        : undefined,
    token,
  };
}
