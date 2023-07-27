import {
  useAccountReady,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';
import { TokenDefinition } from '@notional-finance/core-entities';

export function useAssetInput(
  selectedToken: TokenDefinition | undefined,
  isDebt: boolean
) {
  const [inputString, setInputString] = useState<string>('');
  const isAccountReady = useAccountReady();

  const { token, inputAmount } = useInputAmount(
    inputString,
    selectedToken?.symbol
  );

  const { maxBalanceString, maxBalance, insufficientBalance } =
    useWalletBalanceInputCheck(token, inputAmount);

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  }

  return {
    inputAmount: isDebt ? inputAmount?.neg() : inputAmount,
    maxBalance: maxBalance,
    maxBalanceString: maxBalanceString,
    errorMsg,
    setInputString,
  };
}
