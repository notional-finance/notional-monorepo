import {
  useNotional,
  useCurrencyData,
  useRiskRatios,
} from '@notional-finance/notionable-hooks';
import { TransactionData } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { CashOrFCash, TradePropertyKeys } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import { tradeDefaults } from '@notional-finance/shared-config';
import { useEffect } from 'react';
import { useRemoveAsset } from '../hooks/use-remove-asset';

interface RepayBorrowState {
  inputAmount: TypedBigNumber | undefined;
  netCashAmount: TypedBigNumber | undefined;
  netfCashAmount: TypedBigNumber | undefined;
  selectedToken: string;
  hasError: boolean;
  cashOrfCash: CashOrFCash;
}

const initialRepayBorrowState = {
  hasError: false,
  inputAmount: undefined,
  netCashAmount: undefined,
  netfCashAmount: undefined,
  selectedToken: '',
  cashOrfCash: 'fCash' as CashOrFCash,
};

export function useRepayBorrow(assetKey: string | undefined) {
  const { notional } = useNotional();
  const [state, updateRepayBorrowState] = useFormState<RepayBorrowState>(
    initialRepayBorrowState
  );
  const {
    hasError,
    inputAmount,
    netCashAmount,
    netfCashAmount,
    selectedToken,
    cashOrfCash,
  } = state;
  const { isUnderlying } = useCurrencyData(selectedToken);
  const {
    market,
    address,
    updatedAccountData,
    selectedAsset,
    availableTokens,
    cashBalance,
    tradedRate,
    defaultSelectedToken,
  } = useRemoveAsset(assetKey, cashOrfCash, netCashAmount, netfCashAmount);

  useEffect(() => {
    // This should only run once after initialization
    if (defaultSelectedToken)
      updateRepayBorrowState({ selectedToken: defaultSelectedToken });
  }, [defaultSelectedToken, updateRepayBorrowState]);

  const cashBalanceApplied =
    cashBalance && !cashBalance.isZero() ? cashBalance : undefined;
  const costToRepay = isUnderlying
    ? netCashAmount?.toUnderlying()
    : netCashAmount;
  const {
    loanToValue: updatedLoanToValue,
    collateralRatio: updatedCollateralRatio,
  } = useRiskRatios(updatedAccountData);

  const canSubmit =
    !!selectedAsset &&
    !!notional &&
    !!address &&
    !!inputAmount &&
    hasError === false &&
    !!netfCashAmount &&
    !!netCashAmount &&
    !!costToRepay &&
    !!tradedRate;

  let transactionData: TransactionData | undefined = undefined;
  if (canSubmit) {
    const depositAmount =
      selectedToken === 'ETH'
        ? netCashAmount.neg().toUnderlying(false)
        : undefined;

    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: notional.repayBorrow,
        transactionArgs: [
          address,
          selectedAsset.fCash,
          selectedToken,
          netfCashAmount,
          Math.max(tradedRate - tradeDefaults.defaultAnnualizedSlippage, 0),
          depositAmount,
        ],
      },
      transactionProperties: {
        [TradePropertyKeys.maturity]: selectedAsset.maturity,
        [TradePropertyKeys.costToRepay]: costToRepay?.abs(),
        [TradePropertyKeys.fromCashBalance]: cashBalanceApplied,
        [TradePropertyKeys.repaymentRate]: tradedRate,
        [TradePropertyKeys.collateralRatio]:
          updatedCollateralRatio ?? undefined,
        [TradePropertyKeys.loanToValue]: updatedLoanToValue ?? undefined,
      },
    };
  }

  return {
    selectedToken,
    availableTokens,
    selectedMarketKey: market?.marketKey || null,
    canSubmit,
    updatedAccountData: canSubmit ? updatedAccountData : undefined,
    transactionData,
    sideDrawerInfo: {
      [TradePropertyKeys.costToRepay]: costToRepay?.abs(),
      [TradePropertyKeys.fromCashBalance]: cashBalanceApplied,
      [TradePropertyKeys.repaymentRate]: tradedRate,
    },
    cashOrfCash,
    updateRepayBorrowState,
  };
}
