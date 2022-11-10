import {
  useAccountCashBalance,
  useCurrencyData,
  useNotional,
  useRiskRatios,
} from '@notional-finance/notionable-hooks';
import { TransactionData } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { CashOrFCash, TradePropertyKeys } from '@notional-finance/trade';
import { tradeDefaults, useFormState } from '@notional-finance/utils';
import { useEffect } from 'react';
import { useRemoveAsset } from '../hooks/use-remove-asset';

interface WithdrawLendState {
  inputAmount: TypedBigNumber | undefined;
  netCashAmount: TypedBigNumber | undefined;
  netfCashAmount: TypedBigNumber | undefined;
  selectedToken: string;
  hasError: boolean;
  cashOrfCash: CashOrFCash;
  withdrawToPortfolio: boolean;
}

const initialWithdrawLendState = {
  hasError: false,
  inputAmount: undefined,
  netCashAmount: undefined,
  netfCashAmount: undefined,
  selectedToken: '',
  cashOrfCash: 'fCash' as CashOrFCash,
  withdrawToPortfolio: false,
};

export function useWithdrawLend(assetKey: string | undefined) {
  const [state, updateWithdrawLendState] =
    useFormState<WithdrawLendState>(initialWithdrawLendState);
  const { notional } = useNotional();
  const {
    hasError,
    inputAmount,
    netCashAmount,
    netfCashAmount,
    selectedToken,
    cashOrfCash,
    withdrawToPortfolio,
  } = state;
  const { isUnderlying } = useCurrencyData(selectedToken);
  const cashBalance = useAccountCashBalance(selectedToken);

  const {
    market,
    address,
    updatedAccountData,
    selectedAsset,
    availableTokens,
    tradedRate,
    defaultSelectedToken,
  } = useRemoveAsset(assetKey, cashOrfCash, netCashAmount, netfCashAmount);

  if (withdrawToPortfolio && selectedAsset) {
    updatedAccountData.updateBalance(selectedAsset.currencyId, netCashAmount?.toAssetCash(true));
  }

  const { loanToValue: updatedLoanToValue, collateralRatio: updatedCollateralRatio } =
    useRiskRatios(updatedAccountData);
  const cashWithdrawn = isUnderlying ? netCashAmount?.toUnderlying() : netCashAmount;

  useEffect(() => {
    // This should only run once after initialization
    if (defaultSelectedToken) updateWithdrawLendState({ selectedToken: defaultSelectedToken });
  }, [defaultSelectedToken, updateWithdrawLendState]);

  const canSubmit =
    !!selectedAsset &&
    !!notional &&
    !!address &&
    !!inputAmount &&
    hasError === false &&
    !!netfCashAmount &&
    !!netCashAmount &&
    !!tradedRate;

  let transactionData: TransactionData | undefined = undefined;
  if (canSubmit) {
    // If there is a negative cash balance then we want to withdraw entire cash balance, this will
    // be whatever positive balance is left after repayment
    const hasCashBalance = cashBalance?.isPositive() || false;

    // If there is no cash balance and we are not withdrawing to portfolio (withdrawing to wallet)<
    // then withdraw everything to avoid dust amounts
    const withdrawEntireCashBalance = !hasCashBalance && !withdrawToPortfolio;
    // If there is an existing cash balance we want to only withdraw the netCash amount (only
    // if we are withdrawing to wallet)
    const withdrawAmountInternalPrecision =
      hasCashBalance && !withdrawToPortfolio
        ? netCashAmount.toAssetCash(true)
        : TypedBigNumber.fromBalance(0, selectedAsset.symbol, true);

    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: notional.withdrawLend,
        transactionArgs: [
          address,
          selectedAsset.fCash,
          netfCashAmount.neg(),
          tradedRate + tradeDefaults.defaultAnnualizedSlippage,
          withdrawAmountInternalPrecision,
          withdrawEntireCashBalance,
          isUnderlying,
        ],
      },
      transactionProperties: {
        [TradePropertyKeys.maturity]: selectedAsset.maturity,
        [TradePropertyKeys.amountToWallet]: !withdrawToPortfolio ? cashWithdrawn : undefined,
        [TradePropertyKeys.amountToPortfolio]: withdrawToPortfolio ? cashWithdrawn : undefined,
        [TradePropertyKeys.withdrawLendRate]: tradedRate,
        [TradePropertyKeys.collateralRatio]: updatedCollateralRatio ?? undefined,
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
      [TradePropertyKeys.amountToWallet]: !withdrawToPortfolio ? cashWithdrawn : undefined,
      [TradePropertyKeys.amountToPortfolio]: withdrawToPortfolio ? cashWithdrawn : undefined,
      [TradePropertyKeys.withdrawLendRate]: tradedRate,
    },
    cashOrfCash,
    withdrawToPortfolio,
    updateWithdrawLendState,
  };
}
