import { useSelectedMarket, useMaturityData, useAccount } from '@notional-finance/notionable-hooks';
import { AssetType, TypedBigNumber } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import { borrowState$, initialBorrowState } from './borrow-store';

export function useBorrow(selectedToken: string) {
  const { accountDataCopy } = useAccount();
  const {
    selectedMarketKey,
    hasError,
    inputAmount,
    fCashAmount,
    hasCollateralError,
    collateralAction,
  } = useObservableState(borrowState$, initialBorrowState);
  const selectedMarket = useSelectedMarket(selectedMarketKey);
  const inputAmountUnderlying = inputAmount?.toUnderlying(true);
  const maturityData = useMaturityData(selectedToken, inputAmountUnderlying);

  const tradedRate =
    inputAmountUnderlying?.isPositive() && fCashAmount
      ? selectedMarket?.interestRate(fCashAmount, inputAmountUnderlying)
      : undefined;

  const interestAmountTBN =
    fCashAmount && inputAmountUnderlying?.isPositive()
      ? fCashAmount.abs().sub(inputAmountUnderlying)
      : undefined;

  const canSubmit =
    hasError === false &&
    !!inputAmount &&
    hasCollateralError === false &&
    !!selectedMarket &&
    !!fCashAmount;

  let hasSufficientCollateral: boolean | undefined;
  if (canSubmit) {
    accountDataCopy.updateAsset({
      currencyId: selectedMarket.currencyId,
      maturity: selectedMarket.maturity,
      assetType: AssetType.fCash,
      notional: fCashAmount,
      settlementDate: selectedMarket.maturity,
    });

    // simulate cash balance netting off negative or being fully withdrawn
    const cashBalance = accountDataCopy.cashBalance(selectedMarket.currencyId);
    if (cashBalance?.isPositive()) {
      // Cash balance will be fully withdrawn here
      accountDataCopy.updateBalance(selectedMarket.currencyId, cashBalance.neg());
    } else if (cashBalance?.isNegative()) {
      // Negative cash balance will be repaid to zero
      accountDataCopy.updateBalance(
        selectedMarket.currencyId,
        TypedBigNumber.min(cashBalance.neg(), inputAmount.toAssetCash())
      );
    }

    if (collateralAction) accountDataCopy.updateCollateralAction(collateralAction);
    const { netETHCollateralWithHaircut, netETHDebtWithBuffer } =
      accountDataCopy.getFreeCollateral();
    hasSufficientCollateral = netETHCollateralWithHaircut.gt(netETHDebtWithBuffer);
  }

  return {
    selectedMarketKey,
    canSubmit: canSubmit && hasSufficientCollateral === true,
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    maturityData,
    fCashAmount: fCashAmount?.toFloat(),
    interestAmount: interestAmountTBN?.toFloat(),
    interestAmountTBN,
    tradedRate,
    insufficientCollateralError: hasSufficientCollateral === false
  };
}
