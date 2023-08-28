import {
  useAccountReady,
  useCurrency,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';
import { TokenDefinition } from '@notional-finance/core-entities';

export function useAssetInput(
  selectedToken: TokenDefinition | undefined,
  isDebt: boolean,
  isRollOrConvert: boolean
) {
  const [inputString, setInputString] = useState<string>('');
  const isAccountReady = useAccountReady();
  const { primeDebt, primeCash } = useCurrency();
  if (isRollOrConvert && selectedToken?.tokenType === 'PrimeCash') {
    // Rewrite this to prime debt
    selectedToken = primeDebt.find(
      (t) => t.currencyId === selectedToken?.currencyId
    );
  } else if (isRollOrConvert && selectedToken?.tokenType === 'PrimeDebt') {
    selectedToken = primeCash.find(
      (t) => t.currencyId === selectedToken?.currencyId
    );
  }

  // eslint-disable-next-line prefer-const
  let { token, inputAmount } = useInputAmount(
    inputString,
    selectedToken?.symbol
  );

  const { maxBalance, insufficientBalance } = useWalletBalanceInputCheck(
    token,
    inputAmount
  );

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  }

  if (isRollOrConvert && selectedToken?.tokenType === 'PrimeDebt') {
    inputAmount = inputAmount?.toPrimeCash();
  }

  return {
    inputAmount: isDebt ? inputAmount?.neg() : inputAmount,
    maxBalance: maxBalance?.abs(),
    maxBalanceString: maxBalance?.abs().toExactString(),
    errorMsg,
    setInputString,
  };
}
