import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
  usePrimeCash,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';

export function useMaxWithdraw(context: BaseTradeContext) {
  const { updateState, state } = context;
  const { debt, selectedNetwork } = state;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const primeCash = usePrimeCash(debt?.network, debt?.currencyId);
  const withdrawToken = debt?.tokenType === 'PrimeDebt' ? primeCash : debt;
  const maxWithdraw = withdrawToken
    ? profile?.maxWithdraw(withdrawToken)
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

  return {
    onMaxValue,
    currencyInputRef,
    setCurrencyInput,
    maxWithdrawUnderlying: maxWithdraw?.toUnderlying(),
  };
}
