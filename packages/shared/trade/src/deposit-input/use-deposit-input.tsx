import {
  useAccountReady,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';
import { TokenBalance } from '@notional-finance/core-entities';

export function useDepositInput(
  selectedDepositToken?: string,
  isWithdraw?: boolean,
  useZeroDefault?: boolean
) {
  const [inputString, setInputString] = useState<string>('');
  const isAccountReady = useAccountReady();

  // eslint-disable-next-line prefer-const
  let { token, inputAmount } = useInputAmount(
    inputString,
    selectedDepositToken
  );

  if (useZeroDefault && token && inputAmount === undefined) {
    inputAmount = TokenBalance.zero(token);
  }

  const {
    maxBalanceString,
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  } = useWalletBalanceInputCheck(token, inputAmount);

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (!isWithdraw && isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  } else if (!isWithdraw && isAccountReady && insufficientAllowance === true) {
    errorMsg = tradeErrors.insufficientAllowance;
  }
  if (selectedDepositToken === 'USDC' && insufficientBalance === true) {
    errorMsg = tradeErrors.usdcNotUSDCeMsg;
  }

  return {
    inputAmount: isWithdraw ? inputAmount?.neg() : inputAmount,
    maxBalance: isWithdraw ? undefined : maxBalance,
    // the onMaxValue callback is used instead of a string
    maxBalanceString: isWithdraw ? undefined : maxBalanceString,
    errorMsg,
    decimalPlaces: token?.decimals || 8,
    setInputString,
  };
}
