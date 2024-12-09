import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  useCurrentTradeContext,
  usePortfolioMaxWithdraw,
  usePortfolioRiskProfile,
  usePrimeCash,
  useTradedValue,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

export function useMaxWithdraw() {
  const trade = useCurrentTradeContext();
  const selectedNetwork = trade?.selectedNetwork;
  const { debt } = trade?.selectedTokens ?? {};
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const primeCash = usePrimeCash(debt?.currencyId);
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();

  const withdrawToken = debt?.tokenType === 'PrimeDebt' ? primeCash : debt;
  const balance = profile?.balances.find(
    (t) => t.tokenId === withdrawToken?.id
  );
  const maxWithdraw = usePortfolioMaxWithdraw(withdrawToken);
  const maxWithdrawUnderlying = useTradedValue(maxWithdraw?.neg());

  const onMaxValue = useCallback(() => {
    if (maxWithdrawUnderlying && maxWithdraw) {
      setCurrencyInput(maxWithdrawUnderlying.toExactString(), false);

      trade?.setMaxWithdraw(
        maxWithdrawUnderlying?.neg(),
        undefined,
        debt?.tokenType === 'PrimeDebt'
          ? maxWithdraw.toToken(debt).neg()
          : maxWithdraw.neg()
      );
    }
  }, [maxWithdraw, trade, setCurrencyInput, debt, maxWithdrawUnderlying]);

  const belowMaxWarning =
    balance &&
    trade?.maxWithdraw &&
    maxWithdraw &&
    !!profile?.healthFactor &&
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
