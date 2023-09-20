import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  useCurrency,
  usePortfolioRiskProfile,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';

export function useMaxWithdraw(context: BaseTradeContext) {
  const { updateState, state } = context;
  const { debt } = state;
  const profile = usePortfolioRiskProfile();
  const { primeCash } = useCurrency();
  const withdrawToken =
    debt?.tokenType === 'PrimeDebt'
      ? primeCash.find((t) => t.currencyId === debt?.currencyId)
      : debt;
  const maxWithdraw = withdrawToken
    ? profile.maxWithdraw(withdrawToken)
    : undefined;
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const onMaxValue = useCallback(() => {
    if (maxWithdraw) {
      setCurrencyInput(maxWithdraw?.toUnderlying().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxWithdraw.toUnderlying().neg(),
        debtBalance:
          debt?.tokenType === 'PrimeDebt'
            ? maxWithdraw.toToken(debt).neg()
            : maxWithdraw.neg(),
      });
    }
  }, [maxWithdraw, updateState, setCurrencyInput, debt]);

  return { onMaxValue, currencyInputRef, setCurrencyInput };
}
