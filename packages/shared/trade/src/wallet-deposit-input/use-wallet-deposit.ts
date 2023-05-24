import { Registry } from '@notional-finance/core-entities';
import {
  useSelectedNetwork,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { tradeErrors } from '../tradeErrors';

export function useWalletDeposit(selectedToken: string) {
  const tokens = Registry.getTokenRegistry();
  const [inputString, setInputString] = useState<string>('');
  const selectedNetwork = useSelectedNetwork();

  const inputAmount =
    inputString !== ''
      ? tokens.parseInputToTokenBalance(
          inputString,
          selectedToken,
          selectedNetwork
        )
      : undefined;

  const token = tokens.getTokenBySymbol(selectedNetwork, selectedToken);

  const {
    maxBalanceString,
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  } = useWalletBalanceInputCheck(inputAmount);

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  } else if (insufficientAllowance === true) {
    errorMsg = tradeErrors.insufficientAllowance;
  }

  return {
    inputAmount,
    maxBalance,
    maxBalanceString,
    errorMsg,
    decimalPlaces: token.decimals,
    setInputString,
  };
}
