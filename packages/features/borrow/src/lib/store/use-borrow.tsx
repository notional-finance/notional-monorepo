import { useAccount } from '@notional-finance/notionable-hooks';
import { AssetType, TypedBigNumber } from '@notional-finance/sdk';
import { tradeErrors } from '@notional-finance/trade';
import { useObservableState } from 'observable-hooks';
import { FormattedMessage } from 'react-intl';
import { borrowState$, initialBorrowState } from './borrow-store';
import { MaturityData } from '@notional-finance/notionable';
import { Market } from '@notional-finance/sdk/system';

export function useBorrow(_selectedToken: string) {
  const { accountDataCopy } = useAccount();
  const {
    selectedMarketKey,
    hasError,
    inputAmount,
    fCashAmount,
    hasCollateralError,
    collateralAction,
    borrowToPortfolio,
  } = useObservableState(borrowState$, initialBorrowState);
  const selectedMarket = undefined as Market | undefined;
  const inputAmountUnderlying = inputAmount?.toUnderlying(true);
  const maturityData = [] as MaturityData[];
  const cashBalance = undefined as TypedBigNumber | undefined;

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
    if (borrowToPortfolio) {
      // Add the cash to the portfolio
      accountDataCopy.updateBalance(
        selectedMarket.currencyId,
        inputAmountUnderlying?.toAssetCash()
      );
    } else if (cashBalance?.isPositive()) {
      // Cash balance will be fully withdrawn here
      accountDataCopy.updateBalance(
        selectedMarket.currencyId,
        inputAmountUnderlying?.toAssetCash().neg()
      );
    } else if (cashBalance?.isNegative()) {
      // Negative cash balance will be repaid to zero
      accountDataCopy.updateBalance(
        selectedMarket.currencyId,
        TypedBigNumber.min(cashBalance.neg(), inputAmount.toAssetCash())
      );
    }

    if (collateralAction)
      accountDataCopy.updateCollateralAction(collateralAction);
    const { netETHCollateralWithHaircut, netETHDebtWithBuffer } =
      accountDataCopy.getFreeCollateral();
    hasSufficientCollateral =
      netETHCollateralWithHaircut.gt(netETHDebtWithBuffer);
  }

  let warningMsg: React.ReactNode | undefined;
  if (cashBalance?.isNegative()) {
    warningMsg = (
      <FormattedMessage
        {...{
          ...tradeErrors.negativeCashWarningOnBorrow,
          values: {
            cashBalance: cashBalance.neg().toDisplayStringWithSymbol(),
          },
        }}
      />
    );
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
    insufficientCollateralError: hasSufficientCollateral === false,
    borrowToPortfolio,
    warningMsg,
  };
}
