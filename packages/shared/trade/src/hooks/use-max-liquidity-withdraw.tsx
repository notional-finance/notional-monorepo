import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  useCurrentTradeContext,
  usePortfolioRiskProfile,
  useTradedValue,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';

export function useMaxLiquidityWithdraw() {
  const trade = useCurrentTradeContext();
  const { debt: nToken, collateral } = trade?.selectedTokens ?? {};
  const selectedNetwork = trade?.selectedNetwork;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const maxRepayBalance = profile?.balances.find(
    (t) => t.tokenId === collateral?.id
  );
  const nTokenBalance = profile?.balances.find((t) => t.tokenId === nToken?.id);

  // NOTE: this will show a liquidation risk error if the PNL on the liquidity
  // is being used to collateralize some other debt.
  const maxNTokenUnderlying = useTradedValue(nTokenBalance?.neg());
  // useTradedValue always returns a positive number
  const maxRepayUnderlying = useTradedValue(maxRepayBalance?.neg());
  const maxWithdrawUnderlying =
    maxNTokenUnderlying && maxRepayUnderlying
      ? maxNTokenUnderlying.sub(maxRepayUnderlying)
      : undefined;
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const onMaxValue = useCallback(() => {
    if (maxWithdrawUnderlying) {
      setCurrencyInput(maxWithdrawUnderlying?.toExactString(), false);

      trade?.setMaxWithdraw(
        maxWithdrawUnderlying.neg(),
        maxRepayBalance?.neg(),
        nTokenBalance?.neg()
      );
    }
  }, [
    maxWithdrawUnderlying,
    maxRepayBalance,
    nTokenBalance,
    setCurrencyInput,
    trade,
  ]);

  return {
    onMaxValue: maxWithdrawUnderlying ? onMaxValue : undefined,
    currencyInputRef,
    setCurrencyInput,
    maxWithdrawUnderlying,
  };
}
