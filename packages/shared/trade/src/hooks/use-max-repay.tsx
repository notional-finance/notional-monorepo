import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  useFCashMarket,
  usePortfolioRiskProfile,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import {
  BASIS_POINT,
  FLOATING_POINT_DUST,
  INTERNAL_TOKEN_DECIMALS,
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
} from '@notional-finance/util';
import { useCallback } from 'react';
import { MessageDescriptor } from 'react-intl';
import { tradeErrors } from '../tradeErrors';
import { TokenBalance } from '@notional-finance/core-entities';

export function useMaxRepay(context: BaseTradeContext) {
  const {
    updateState,
    state: { collateral, maxWithdraw },
  } = context;
  const fCashMarket = useFCashMarket(collateral?.currencyId);
  const profile = usePortfolioRiskProfile();

  // Find the matching debt balance in the risk profile. For prime debt repayment,
  // this will already be in prime cash denomination.
  const maxRepay = profile.debts.find((d) => d.tokenId === collateral?.id);
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  let maxRepayAmount: TokenBalance | undefined;
  if (maxRepay?.tokenType === 'PrimeCash') {
    // Increase the prime cash repay amount by a dust amount to ensure that the txn fully
    // repays the prime debt which is accruing constantly.
    //  accumulatedInterest = e ^ ((rate * SECONDS_FROM_TXN) / SECONDS_IN_YEAR)
    //  if timeToConfirmation = 2 hours @ 200% interest (bad case assumption):
    //    e ^ 200% * (3600 * 2 * 2 / SECONDS_IN_YEAR) ~ 1.00045
    maxRepayAmount = maxRepay
      .toUnderlying()
      .mulInRatePrecision(RATE_PRECISION + 5 * BASIS_POINT);

    if (maxRepayAmount.abs().toFloat() <= FLOATING_POINT_DUST) {
      // If this is a dust amount just double the repayment to make sure it clears the dust
      maxRepayAmount = maxRepayAmount.mulInRatePrecision(2 * RATE_PRECISION);
    }
  } else {
    const tokensOut =
      fCashMarket && maxRepay
        ? fCashMarket.calculateTokenTrade(maxRepay, 0)?.tokensOut
        : undefined;
    // Buffer this payment a little bit to avoid prime borrows
    maxRepayAmount = tokensOut
      ?.toUnderlying()
      .mulInRatePrecision(RATE_PRECISION + BASIS_POINT);
  }

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
