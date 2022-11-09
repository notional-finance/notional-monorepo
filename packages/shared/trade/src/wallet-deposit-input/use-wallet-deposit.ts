import { useNotional, useWalletBalanceInputCheck } from '@notional-finance/notionable-hooks';
import { MessageDescriptor } from 'react-intl';
import { tradeErrors } from '../tradeErrors';

export function useWalletDeposit(selectedToken: string, inputString: string) {
  const { notional } = useNotional();
  const isInternal = selectedToken === 'NOTE' ? true : false;

  const inputAmount =
    inputString && notional
      ? notional.parseInput(inputString, selectedToken, isInternal)
      : undefined;

  const { maxBalanceString, maxBalance, insufficientBalance, insufficientAllowance } =
    useWalletBalanceInputCheck(selectedToken, inputAmount);

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
  };
}
