import { useCurrencyInputRef } from '@notional-finance/mui';
import { BaseTradeContext, usePortfolioRiskProfile } from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';

export function useMaxWithdraw(context: BaseTradeContext) {
  const {
    updateState,
    state: { debt },
  } = context;
  const profile = usePortfolioRiskProfile();
  const maxWithdraw = debt ? profile.maxWithdraw(debt) : undefined;
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const onMaxValue = useCallback(() => {
    if (maxWithdraw) {
      setCurrencyInput(maxWithdraw?.toUnderlying().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: undefined,
        debtBalance: maxWithdraw.neg(),
      });
    }
  }, [maxWithdraw, updateState, setCurrencyInput]);

  return { onMaxValue, currencyInputRef };
}
