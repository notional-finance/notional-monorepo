import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
  usePrimeCash,
  useTradedValue,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

export function useMaxWithdraw(context: BaseTradeContext) {
  const { updateState, state } = context;
  const { debt, selectedNetwork } = state;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const primeCash = usePrimeCash(debt?.currencyId);
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const withdrawToken = debt?.tokenType === 'PrimeDebt' ? primeCash : debt;
  const balance = profile?.balances.find(
    (t) => t.tokenId === withdrawToken?.id
  );
  const maxWithdraw = withdrawToken
    ? profile?.maxWithdraw(withdrawToken)
    : undefined;
  const maxWithdrawUnderlying = useTradedValue(maxWithdraw?.neg());

  const onMaxValue = useCallback(() => {
    if (maxWithdrawUnderlying && maxWithdraw) {
      setCurrencyInput(maxWithdrawUnderlying.toExactString(), false);

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

  const belowMaxWarning =
    balance &&
    state.maxWithdraw &&
    maxWithdraw &&
    !!profile?.healthFactor() &&
    maxWithdraw.ratioWith(balance).toNumber() < 0.999e9 ? (
      <FormattedMessage
        defaultMessage={'Max withdraw restricted by liquidation risk.'}
      />
    ) : undefined;

  return {
    onMaxValue: maxWithdraw ? onMaxValue : undefined,
    currencyInputRef,
    setCurrencyInput,
    maxWithdrawUnderlying,
    belowMaxWarning,
  };
}
