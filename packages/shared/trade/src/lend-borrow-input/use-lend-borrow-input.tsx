import { LEND_BORROW } from '@notional-finance/shared-config';
import {
  useSelectedMarket,
  useNotional,
  useAccount,
  useCurrencyData,
  useTokenData,
  useAccountCashBalance,
} from '@notional-finance/notionable-hooks';
import { Asset, AssetType, TypedBigNumber } from '@notional-finance/sdk';
import { CashOrFCash } from './lend-borrow-input';
import { tradeErrors } from '../tradeErrors';
import { MessageDescriptor } from 'react-intl';

export function useLendBorrowInput(
  selectedToken: string,
  cashOrfCash: CashOrFCash,
  lendOrBorrow: LEND_BORROW,
  isRemoveAsset: boolean,
  selectedMarketKey: string | null,
  inputString: string,
  selectedAssetKey?: string
) {
  const { notional } = useNotional();
  const { accountDataCopy, assetSummary } = useAccount();
  const selectedMarket = useSelectedMarket(selectedMarketKey);
  const { isUnderlying } = useCurrencyData(selectedToken);
  const { tokenData } = useTokenData(selectedToken);
  const walletBalance = tokenData?.balance.toInternalPrecision();
  const accountCashBalance = useAccountCashBalance(selectedToken);
  const inputAmount =
    inputString && notional
      ? notional.parseInput(inputString, selectedToken, true)
      : undefined;

  let errorMsg: MessageDescriptor | undefined;
  let netCashAmount: TypedBigNumber | undefined;
  let netfCashAmount: TypedBigNumber | undefined;
  let maxAmount: TypedBigNumber | undefined;

  // If we have a selected market then we can update the cash and fCash sides
  // of the trade. If not, show the error.
  if (selectedMarket && inputAmount) {
    try {
      if (cashOrfCash === 'Cash') {
        netCashAmount =
          lendOrBorrow === LEND_BORROW.LEND
            ? inputAmount.toUnderlying(true).neg()
            : inputAmount;
        netfCashAmount =
          selectedMarket.getfCashAmountGivenCashAmount(netCashAmount);
      } else {
        // fCash Input
        netfCashAmount =
          lendOrBorrow === LEND_BORROW.BORROW ? inputAmount.neg() : inputAmount;
        ({ netCashToAccount: netCashAmount } =
          selectedMarket.getCashAmountGivenfCashAmount(netfCashAmount));
      }
    } catch (e) {
      errorMsg = tradeErrors.insufficientLiquidity;
    }
  }

  if (isRemoveAsset) {
    let matchingAsset: Asset | undefined;
    if (selectedAssetKey) {
      matchingAsset = assetSummary.get(selectedAssetKey)?.fCash;
    } else {
      matchingAsset = accountDataCopy.portfolio.find(
        (a) =>
          a.maturity === selectedMarket?.maturity &&
          a.currencyId === selectedMarket.currencyId &&
          a.assetType === AssetType.fCash
      );
    }
    const assetMax = matchingAsset?.notional.abs();

    if (cashOrfCash === 'fCash') {
      // If removing an asset, cannot exceed the max fCash amount. We only allow maxAmount
      // input on fCash inputs since cash inputs are not precise
      maxAmount = assetMax;
    }

    if (assetMax && netfCashAmount && netfCashAmount.abs().gt(assetMax)) {
      errorMsg = tradeErrors.insufficientBalance;
    }
  } else if (lendOrBorrow === LEND_BORROW.LEND) {
    let maxCashInput: TypedBigNumber | undefined = undefined;
    if (accountCashBalance && walletBalance) {
      maxCashInput = walletBalance.add(
        isUnderlying
          ? accountCashBalance.toUnderlying(true)
          : accountCashBalance
      );
    } else if (accountCashBalance) {
      maxCashInput = isUnderlying
        ? accountCashBalance.toUnderlying(true)
        : accountCashBalance;
    } else if (walletBalance) {
      maxCashInput = walletBalance;
    }

    if (cashOrfCash === 'Cash') {
      // We don't allow max fCash input on lending because it will change as market data
      // changes and time passes.
      maxAmount = maxCashInput;
    }

    if (maxAmount && inputAmount && inputAmount.abs().gt(maxAmount)) {
      errorMsg = tradeErrors.insufficientBalance;
    }
  }

  if (!errorMsg && inputAmount && !selectedMarket) {
    errorMsg = tradeErrors.selectMaturityToCompleteTrade;
  }

  return {
    inputAmount,
    inputString,
    errorMsg,
    netCashAmount,
    netfCashAmount,
    maxAmount,
    maxAmountString: maxAmount?.toExactString(),
  };
}
