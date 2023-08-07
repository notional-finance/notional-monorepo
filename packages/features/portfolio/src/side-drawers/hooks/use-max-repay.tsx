import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
} from '@notional-finance/notionable-hooks';
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
      setCurrencyInput(maxRepay?.abs().toUnderlying().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: undefined,
        collateralBalance: maxRepay.neg(),
      });
    }
  }, [maxRepay, updateState, setCurrencyInput]);

  return { onMaxValue, currencyInputRef };
}
