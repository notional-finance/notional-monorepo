import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { useCurrentNetworkStore } from '@notional-finance/notionable';
import { Network } from '@notional-finance/util';
import { utils } from 'ethers';

export function useInputAmount(
  selectedNetwork: Network | undefined,
  inputString: string,
  selectedToken?: string,
  suppressZero = true
) {
  const model = useCurrentNetworkStore();
  if (!selectedNetwork || !selectedToken)
    return { inputAmount: undefined, token: undefined };

  let token: TokenDefinition | undefined;
  try {
    token = model.getTokenBySymbol(selectedToken);
  } catch {
    token = model.getTokenByID(selectedToken);
  }
  if (!token) throw Error(`${selectedToken} token not found`);
  const value =
    inputString !== '' && inputString !== '.'
      ? typeof inputString === 'string'
        ? utils.parseUnits(inputString.replace(/,/g, ''), token.decimals)
        : inputString
      : undefined;
  const inputAmount = value ? TokenBalance.from(value, token) : undefined;

  return {
    inputAmount:
      inputAmount?.isZero() && suppressZero ? undefined : inputAmount,
    token,
  };
}
