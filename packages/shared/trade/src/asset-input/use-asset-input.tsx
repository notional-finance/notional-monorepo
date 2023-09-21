import {
  useAccountReady,
  usePortfolioRiskProfile,
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
  const profile = usePortfolioRiskProfile();
  const maxBalance =
    selectedToken?.tokenType === 'PrimeDebt'
      ? profile.balances
          .find(
            (b) =>
              b.tokenType === 'PrimeCash' &&
              b.currencyId === selectedToken.currencyId
          )
          ?.toToken(selectedToken)
      : profile.balances.find((b) => b.tokenId === selectedToken?.id);
  const { inputAmount } = useInputAmount(inputString, selectedToken?.symbol);

  const insufficientBalance =
    inputAmount && maxBalance ? maxBalance.abs().lt(inputAmount) : false;

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  }

  return {
    inputAmount: isDebt ? inputAmount?.neg() : inputAmount,
    maxBalance: maxBalance?.abs(),
    maxBalanceString: maxBalance?.abs().toExactString(),
    errorMsg,
    setInputString,
  };
}
