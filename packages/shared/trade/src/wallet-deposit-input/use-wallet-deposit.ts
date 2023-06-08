import { useWalletBalanceInputCheck } from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';

export function useWalletDeposit(selectedToken: string) {
  const [inputString, setInputString] = useState<string>('');
  const { token, inputAmount } = useInputAmount(inputString, selectedToken);

  const {
    maxBalanceString,
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  } = useWalletBalanceInputCheck(token, inputAmount);

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
    decimalPlaces: token?.decimals || 8,
    setInputString,
  };
}
