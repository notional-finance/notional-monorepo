import { useQueryParams } from '@notional-finance/utils';
import { tradeDefaults } from '@notional-finance/shared-config';
import {
  useNotional,
  useAccount,
  useCurrencyData,
  useAccountCashBalance,
} from '@notional-finance/notionable-hooks';
import { useObservableState } from 'observable-hooks';
import { borrowState$, initialBorrowState } from './borrow-store';
import { useBorrow } from './use-borrow';
import { TradePropertyKeys } from '@notional-finance/trade';
import { Market } from '@notional-finance/sdk/system';

export function useBorrowTransaction(selectedToken: string) {
  const { notional } = useNotional();
  const { address } = useAccount();
  const { tradedRate, interestAmountTBN } = useBorrow(selectedToken);
  const {
    fCashAmount,
    inputAmount,
    collateralAction,
    collateralApy,
    collateralSymbol,
    borrowToPortfolio,
  } = useObservableState(borrowState$, initialBorrowState);
  const { isUnderlying, assetSymbol } = useCurrencyData(selectedToken);
  const selectedMarket = undefined as Market | undefined;
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;
  const cashBalance = useAccountCashBalance(selectedToken);

  if (
    !confirmRoute ||
    !notional ||
    !address ||
    !assetSymbol ||
    !selectedMarket ||
    !fCashAmount ||
    !inputAmount ||
    !inputAmount ||
    tradedRate === undefined ||
    interestAmountTBN === undefined
  ) {
    return undefined;
  }

  const withdrawEntireCashBalance =
    (cashBalance?.isZero() || cashBalance === undefined) && !borrowToPortfolio;
  const withdrawAmountInternalPrecision =
    withdrawEntireCashBalance || borrowToPortfolio
      ? inputAmount.toAssetCash().copy(0)
      : inputAmount.toAssetCash();

  const maxSlippage = tradedRate + tradeDefaults.defaultAnnualizedSlippage;
  const buildTransactionCall = {
    transactionFn: notional.borrow,
    transactionArgs: [
      address,
      selectedToken,
      fCashAmount,
      selectedMarket.marketIndex,
      maxSlippage,
      withdrawAmountInternalPrecision,
      withdrawEntireCashBalance,
      isUnderlying, // redeem to underlying
      collateralAction, // collateral action
    ],
  };

  return {
    buildTransactionCall,
    transactionHeader: '',
    transactionProperties: {
      [TradePropertyKeys.amountToPortfolio]: borrowToPortfolio
        ? inputAmount
        : undefined,
      [TradePropertyKeys.amountToWallet]: !borrowToPortfolio
        ? inputAmount
        : undefined,
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
