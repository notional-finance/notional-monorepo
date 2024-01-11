import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';

export function useMaxLiquidityWithdraw(context: BaseTradeContext) {
  const { updateState, state } = context;
  const { debt: nToken, collateral, selectedNetwork } = state;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const maxRepayBalance = profile.balances.find(
    (t) => t.tokenId === collateral?.id
  );
  const nTokenBalance = profile.balances.find((t) => t.tokenId === nToken?.id);

  // NOTE: this will show a liquidation risk error if the PNL on the liquidity
  // is being used to collateralize some other debt.
  const maxWithdraw =
    nTokenBalance && maxRepayBalance
      ? nTokenBalance.toUnderlying().add(maxRepayBalance.toUnderlying())
      : undefined;
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const onMaxValue = useCallback(() => {
    if (maxWithdraw) {
      setCurrencyInput(maxWithdraw?.toUnderlying().toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxWithdraw.toUnderlying().neg(),
        collateralBalance: maxRepayBalance?.neg(),
        debtBalance: nTokenBalance?.neg(),
      });
    }
  }, [
    maxRepayBalance,
    nTokenBalance,
    maxWithdraw,
    setCurrencyInput,
    updateState,
  ]);

  return { onMaxValue, currencyInputRef, setCurrencyInput, maxWithdraw };
}
