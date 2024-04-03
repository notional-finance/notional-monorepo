import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
  usePrimeCash,
  useTradedValue,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';

export function useMaxWithdraw(context: BaseTradeContext) {
  const { updateState, state } = context;
  const { debt, selectedNetwork } = state;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const primeCash = usePrimeCash(debt?.network, debt?.currencyId);
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const withdrawToken = debt?.tokenType === 'PrimeDebt' ? primeCash : debt;
  const maxWithdraw = withdrawToken
    ? profile?.maxWithdraw(withdrawToken)
    : undefined;
  const maxWithdrawUnderlying = useTradedValue(maxWithdraw?.neg());

  const onMaxValue = useCallback(() => {
    if (maxWithdraw) {
      setCurrencyInput(maxWithdraw?.toUnderlying().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxWithdrawUnderlying?.neg(),
        debtBalance:
          debt?.tokenType === 'PrimeDebt'
            ? maxWithdraw.toToken(debt).neg()
            : maxWithdraw.neg(),
      });
    }
  }, [maxWithdraw, updateState, setCurrencyInput, debt, maxWithdrawUnderlying]);

  return {
    onMaxValue,
    currencyInputRef,
    setCurrencyInput,
    maxWithdrawUnderlying,
  };
}
