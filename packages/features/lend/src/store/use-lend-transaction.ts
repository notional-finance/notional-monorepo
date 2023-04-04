import { useQueryParams } from '@notional-finance/utils';
import { tradeDefaults } from '@notional-finance/shared-config';
import {
  useAccount,
  useCurrencyData,
  useNotional,
  useSelectedMarket,
} from '@notional-finance/notionable-hooks';
import { Market } from '@notional-finance/sdk/src/system';
import { useObservableState } from 'observable-hooks';
import { initialLendState, lendState$ } from './lend-store';
import { useBalanceInfo } from './use-balance-info';
import { useLend } from './use-lend';
import { TradePropertyKeys } from '@notional-finance/trade';

export function useLendTransaction() {
  const { notional } = useNotional();
  const { address } = useAccount();
  const { selectedToken, selectedMarketKey, tradedRate, interestAmountTBN } =
    useLend();
  const { usedWalletBalance, usedAccountBalance, hasCashBalance } =
    useBalanceInfo();
  const { fCashAmount, inputAmount } = useObservableState(
    lendState$,
    initialLendState
  );
  const { isUnderlying, assetSymbol } = useCurrencyData(selectedToken);
  const selectedMarket = useSelectedMarket(selectedMarketKey);
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;
  // If hasCashBalance is true then we use the used wallet balance figure, otherwise
  // there is no cash balance and we use inputAmount instead.
  const depositAmount = (
    hasCashBalance ? usedWalletBalance : inputAmount
  )?.toExternalPrecision();

  if (
    !confirmRoute ||
    !notional ||
    !address ||
    !assetSymbol ||
    !selectedMarket ||
    !isUnderlying ||
    !fCashAmount ||
    !depositAmount ||
    !inputAmount ||
    tradedRate === undefined ||
    interestAmountTBN === undefined
  ) {
    return undefined;
  }

  let buildTransactionCall;
  const minSlippage = Math.max(
    tradedRate - tradeDefaults.defaultAnnualizedSlippage,
    0
  );
  if (selectedToken === 'ETH') {
    const { exchangeRatePostSlippage } = Market.getSlippageRate(
      fCashAmount,
      inputAmount,
      selectedMarket.maturity,
      -1 * tradeDefaults.defaultAnnualizedSlippage
    );
    const adjfCashAmount = Market.fCashFromExchangeRate(
      exchangeRatePostSlippage,
      inputAmount
    );

    buildTransactionCall = {
      transactionFn: notional.lend,
      transactionArgs: [
        address,
        selectedToken,
        depositAmount,
        adjfCashAmount,
        selectedMarket.marketIndex,
        minSlippage,
        depositAmount.copy(0).toAssetCash().toInternalPrecision(),
        true, // This always withdraws cash no matter what since cash is applied first
        true, // is underlying
      ],
    };
  } else {
    buildTransactionCall = {
      transactionFn: notional.batchLend,
      transactionArgs: [
        address,
        selectedToken,
        fCashAmount,
        selectedMarket.marketIndex,
        minSlippage,
      ],
    };
  }

  return {
    buildTransactionCall,
    transactionHeader: '',
    transactionProperties: {
      [TradePropertyKeys.maturity]: selectedMarket.maturity,
      [TradePropertyKeys.deposit]: depositAmount,
      [TradePropertyKeys.fromCashBalance]: usedAccountBalance?.isZero()
        ? undefined
        : usedAccountBalance,
      [TradePropertyKeys.interestEarned]: interestAmountTBN,
      [TradePropertyKeys.apy]: tradedRate,
      [TradePropertyKeys.fCashMinted]: fCashAmount,
    },
  };
}
