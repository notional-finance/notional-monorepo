import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';
import { useCallback } from 'react';
import { MessageDescriptor } from 'react-intl';
import { tradeErrors } from '../tradeErrors';

export function useMaxRepay(context: BaseTradeContext) {
  const {
    updateState,
    state: { collateral, maxWithdraw },
  } = context;
  const profile = usePortfolioRiskProfile();

  // Find the matching debt balance in the risk profile. For prime debt repayment,
  // this will already be in prime cash denomination.
  const maxRepay = profile.debts.find((d) => d.tokenId === collateral?.id);
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  // Increase the prime cash repay amount by a dust amount to ensure that the txn fully
  // repays the prime debt which is accruing constantly.
  //  accumulatedInterest = e ^ ((rate * SECONDS_FROM_TXN) / SECONDS_IN_YEAR)
  //  if timeToConfirmation = 2 hours @ 200% interest (bad case assumption):
  //    e ^ 200% * (3600 * 2 * 2 / SECONDS_IN_YEAR) ~ 1.00045
  const maxRepayAmount =
    maxRepay?.tokenType === 'PrimeCash'
      ? maxRepay
          .toUnderlying()
          .mulInRatePrecision(RATE_PRECISION + 5 * BASIS_POINT)
      : maxRepay?.toUnderlying();

  const { insufficientBalance, insufficientAllowance } =
    useWalletBalanceInputCheck(maxRepayAmount?.token, maxRepayAmount?.abs());
  let errorMsg: MessageDescriptor | undefined = undefined;
  if (maxWithdraw && insufficientBalance) {
    errorMsg = tradeErrors.insufficientBalance;
  } else if (maxWithdraw && insufficientAllowance) {
    errorMsg = tradeErrors.insufficientAllowance;
  }

  const onMaxValue = useCallback(() => {
    if (maxRepayAmount && maxRepay) {
      setCurrencyInput(maxRepayAmount.abs().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxRepayAmount.neg(),
        collateralBalance: maxRepay.neg(),
      });
    }
  }, [maxRepay, updateState, setCurrencyInput, maxRepayAmount]);

  return {
    onMaxValue,
    currencyInputRef,
    setCurrencyInput,
    errorMsg,
    requiredApprovalAmount: maxWithdraw ? maxRepayAmount?.abs() : undefined,
  };
}
