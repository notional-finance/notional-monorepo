import { useQueryParams } from '@notional-finance/utils';
import { tradeDefaults } from '@notional-finance/shared-config';
import {
  useNotional,
  useAccount,
  useCurrencyData,
  useSelectedMarket,
} from '@notional-finance/notionable-hooks';
import { TypedBigNumber } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import { borrowState$, initialBorrowState } from './borrow-store';
import { useBorrow } from './use-borrow';
import { TradePropertyKeys } from '@notional-finance/trade';

export function useBorrowTransaction(selectedToken: string) {
  const { notional } = useNotional();
  const { address } = useAccount();
  const { selectedMarketKey, tradedRate, interestAmountTBN } =
    useBorrow(selectedToken);
  const {
    fCashAmount,
    inputAmount,
    collateralAction,
    collateralApy,
    collateralSymbol,
  } = useObservableState(borrowState$, initialBorrowState);
  const { isUnderlying, assetSymbol } = useCurrencyData(selectedToken);
  const selectedMarket = useSelectedMarket(selectedMarketKey);
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;

  if (
    !confirmRoute ||
    !notional ||
    !address ||
    !assetSymbol ||
    !selectedMarket ||
    !fCashAmount ||
    !inputAmount ||
    tradedRate === undefined ||
    interestAmountTBN === undefined
  ) {
    return undefined;
  }

  const maxSlippage = tradedRate + tradeDefaults.defaultAnnualizedSlippage;
  const buildTransactionCall = {
    transactionFn: notional.borrow,
    transactionArgs: [
      address,
      selectedToken,
      fCashAmount,
      selectedMarket.marketIndex,
      maxSlippage,
      TypedBigNumber.fromBalance(0, assetSymbol, true),
      true, // withdraw entire cash balance
      isUnderlying, // redeem to underlying
      collateralAction, // collateral action
    ],
  };

  return {
    buildTransactionCall,
    transactionHeader: '',
    transactionProperties: {
      [TradePropertyKeys.amountToWallet]: inputAmount,
      [TradePropertyKeys.maturity]: selectedMarket.maturity,
      [TradePropertyKeys.interestDue]: interestAmountTBN,
      [TradePropertyKeys.apy]: tradedRate,
      [TradePropertyKeys.collateralDeposit]: collateralAction?.amount,
      // Don't show these values if no collateral action is defined
      [TradePropertyKeys.collateralAPY]: collateralAction
        ? collateralApy
        : undefined,
      [TradePropertyKeys.collateralType]: collateralAction
        ? collateralSymbol
        : undefined,
    },
  };
}
