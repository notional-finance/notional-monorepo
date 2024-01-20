import { BaseTradeState } from '@notional-finance/notionable';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { RATE_DECIMALS } from '@notional-finance/util';

export function useFCashPriceExposure(state: BaseTradeState) {
  const {
    deposit,
    collateralBalance,
    debtBalance,
    netRealizedCollateralBalance,
    netRealizedDebtBalance,
  } = state;
  const fCashMarket = useFCashMarket(deposit);
  if (!fCashMarket) return [];

  if (
    collateralBalance?.tokenType === 'fCash' &&
    netRealizedCollateralBalance
  ) {
    const purchasePrice = netRealizedCollateralBalance
      .abs()
      .toUnderlying()
      .divInRatePrecision(collateralBalance.abs().scaleTo(RATE_DECIMALS));
    return fCashMarket.getfCashPriceExposure(collateralBalance, purchasePrice);
  } else if (debtBalance?.tokenType === 'fCash' && netRealizedDebtBalance) {
    const purchasePrice = netRealizedDebtBalance
      .abs()
      .toUnderlying()
      .divInRatePrecision(debtBalance.abs().scaleTo(RATE_DECIMALS));
    return fCashMarket.getfCashPriceExposure(debtBalance, purchasePrice);
  } else {
    return [];
  }
}
