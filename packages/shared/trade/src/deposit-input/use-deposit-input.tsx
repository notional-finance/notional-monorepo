import {
  useAccountReady,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';

export function useDepositInput(selectedDepositToken?: string) {
  const [inputString, setInputString] = useState<string>('');
  const isAccountReady = useAccountReady();

  const { token, inputAmount } = useInputAmount(
    inputString,
    selectedDepositToken
  );

  const {
    maxBalanceString,
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  } = useWalletBalanceInputCheck(token, inputAmount);

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  } else if (isAccountReady && insufficientAllowance === true) {
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
