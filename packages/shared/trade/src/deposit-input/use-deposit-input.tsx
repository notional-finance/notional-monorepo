import {
  useAccountReady,
  usePortfolioRiskProfile,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';
import { TokenDefinition } from '@notional-finance/core-entities';

export function useDepositInput(
  selectedDepositToken?: string,
  isWithdraw?: boolean,
  withdrawToken?: TokenDefinition
) {
  const [inputString, setInputString] = useState<string>('');
  const isAccountReady = useAccountReady();
  const profile = usePortfolioRiskProfile();

  const { token, inputAmount } = useInputAmount(
    inputString,
    selectedDepositToken
  );

  const maxWithdraw = withdrawToken
    ? profile.maxWithdraw(withdrawToken)
    : undefined;

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

  return {
    inputAmount: isWithdraw ? inputAmount?.neg() : inputAmount,
    maxBalance: isWithdraw ? maxWithdraw : maxBalance,
    // the onMaxValue callback is used instead of a string
    maxBalanceString: isWithdraw ? undefined : maxBalanceString,
    errorMsg,
    decimalPlaces: token?.decimals || 8,
    setInputString,
  };
}
