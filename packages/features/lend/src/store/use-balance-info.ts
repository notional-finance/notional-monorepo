import { TypedBigNumber } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import {
  useAccountCashBalance,
  useCurrencyData,
  useWallet,
} from '@notional-finance/notionable-hooks';
import { lendState$, initialLendState } from './lend-store';

export const useBalanceInfo = () => {
  const { selectedToken, inputAmount, fillDefaultCashBalance } =
    useObservableState(lendState$, initialLendState);
  const {
    id: currencyId,
    isUnderlying,
    assetSymbol,
  } = useCurrencyData(selectedToken);
  const { tokens } = useWallet();
  const _accountBalance = useAccountCashBalance(selectedToken);
  const _walletBalance = tokens
    .get(selectedToken)
    ?.balance.toInternalPrecision();

  const hasAllData =
    selectedToken &&
    currencyId &&
    assetSymbol &&
    _walletBalance &&
    _accountBalance;
  const inputAmountMismatch =
    inputAmount && inputAmount?.symbol !== selectedToken;

  if (hasAllData && !inputAmountMismatch) {
    const ZERO = isUnderlying
      ? TypedBigNumber.getZeroUnderlying(currencyId)
      : TypedBigNumber.fromBalance(0, assetSymbol, true);
    const amountEntered = inputAmount ?? ZERO;

    const maxTradeAmount = _walletBalance.add(_accountBalance);
    let usedWalletBalance: TypedBigNumber;
    let usedAccountBalance: TypedBigNumber;

    if (amountEntered.gt(maxTradeAmount)) {
      usedWalletBalance = ZERO;
      usedAccountBalance = ZERO;
    } else if (amountEntered.gt(ZERO) && amountEntered.lte(_accountBalance)) {
      usedWalletBalance = ZERO;
      usedAccountBalance = amountEntered;
    } else if (amountEntered.gt(_accountBalance)) {
      usedAccountBalance = _accountBalance;
      usedWalletBalance = amountEntered.sub(_accountBalance);
    } else {
      usedWalletBalance = ZERO;
      usedAccountBalance = ZERO;
    }

    // Only allow the max account amount to be set if there is a positive
    // cash balance. When there is a negative cash balance it will automatically
    // offset against any deposited amount
    return {
      cashBalanceString: _accountBalance.isPositive()
        ? _accountBalance.toExactString()
        : '',
      usedWalletBalance,
      usedAccountBalance,
      hasCashBalance: _accountBalance.isPositive(),
      fillDefaultCashBalance,
    };
  } else {
    return {
      cashBalanceString: '',
      usedWalletBalance: selectedToken
        ? inputAmount || TypedBigNumber.fromBalance(0, selectedToken, true)
        : undefined,
      usedAccountBalance: selectedToken
        ? TypedBigNumber.fromBalance(0, selectedToken, true)
        : undefined,
      hasCashBalance: false,
      fillDefaultCashBalance: false,
    };
  }
};
