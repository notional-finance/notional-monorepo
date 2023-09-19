import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
} from '@notional-finance/notionable-hooks';
import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';
import { useCallback } from 'react';

export function useMaxRepay(context: BaseTradeContext) {
  const {
    updateState,
    state: { collateral },
  } = context;
  const profile = usePortfolioRiskProfile();

  // Find the matching debt balance in the risk profile. For prime debt repayment,
  // this will already be in prime cash denomination.
  const maxRepay = profile.debts.find((d) => d.tokenId === collateral?.id);
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const onMaxValue = useCallback(() => {
    if (maxRepay) {
      // Increase the prime cash repay amount by a dust amount to ensure that the txn fully
      // repays the prime debt which is accruing constantly.
      //  accumulatedInterest = e ^ ((rate * SECONDS_FROM_TXN) / SECONDS_IN_YEAR)
      //  if timeToConfirmation = 2 hours @ 200% interest (bad case assumption):
      //    e ^ 200% * (3600 * 2 * 2 / SECONDS_IN_YEAR) ~ 1.00045
      const maxRepayAmount =
        maxRepay.tokenType === 'PrimeCash'
          ? maxRepay
              .toUnderlying()
              .mulInRatePrecision(RATE_PRECISION + 5 * BASIS_POINT)
          : maxRepay.toUnderlying();

      setCurrencyInput(maxRepayAmount.abs().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxRepayAmount.neg(),
        collateralBalance: maxRepay.neg(),
      });
    }
  }, [maxRepay, updateState, setCurrencyInput]);

  return { onMaxValue, currencyInputRef };
}
