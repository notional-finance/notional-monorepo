import {
  useAccountReady,
  useMaxAssetBalance,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';
import { BaseTradeState } from '@notional-finance/notionable';

export function useAssetInput(
  state: BaseTradeState,
  debtOrCollateral: 'Debt' | 'Collateral'
) {
  const [inputString, setInputString] = useState<string>('');
  const {
    debt,
    collateral,
    collateralBalance,
    debtBalance,
    availableCollateralTokens,
    availableDebtTokens,
    tradeType,
    selectedNetwork
  } = state;

  const selectedToken = debtOrCollateral === 'Debt' ? debt : collateral;
  const computedBalance =
    debtOrCollateral === 'Debt' ? debtBalance : collateralBalance;
  let availableTokens =
    debtOrCollateral === 'Debt'
      ? availableDebtTokens
      : availableCollateralTokens;
  if (
    selectedToken &&
    (availableTokens?.length === 0 ||
      tradeType === 'ConvertAsset' ||
      tradeType === 'RollDebt')
  )
    availableTokens = [selectedToken];

  const maxBalance = useMaxAssetBalance(selectedToken);
  const { inputAmount } = useInputAmount(selectedNetwork, inputString, selectedToken?.symbol);
  const isAccountReady = useAccountReady(selectedNetwork);

  const insufficientBalance =
    inputAmount && maxBalance ? maxBalance.abs().lt(inputAmount) : false;

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  }

  return {
    inputAmount: debtOrCollateral === 'Debt' ? inputAmount?.neg() : inputAmount,
    maxBalance: maxBalance?.abs(),
    maxBalanceString: maxBalance?.abs().toExactString(),
    errorMsg,
    setInputString,
    computedBalance,
    selectedToken,
    availableTokens: availableTokens?.map((token) => ({ token })) || [],
  };
}
