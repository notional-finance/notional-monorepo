import {
  useFCashMarket,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { tradeErrors } from '../tradeErrors';
import { useInputAmount } from '../common';
import { TokenBalance } from '@notional-finance/core-entities';
import { Market } from '@notional-finance/sdk/system';
import { useState } from 'react';

export function useLendBorrowInput(
  selectedToken: string,
  selectedMarketKey: string | null
) {
  const [inputString, setInputString] = useState<string>('');
  const { inputAmount, token } = useInputAmount(inputString, selectedToken);
  const fCashMarket = useFCashMarket(token.currencyId);
  const marketIndex = selectedMarketKey
    ? Market.parseMarketIndex(selectedMarketKey)
    : undefined;

  // TODO: do we add these together for max balance?
  // const walletBalance = useBalance(selectedToken);
  // const accountCashBalance = usePrimeCashBalance(selectedToken);
  const { maxBalanceString, maxBalance, insufficientBalance } =
    useWalletBalanceInputCheck(inputAmount);

  let errorMsg = insufficientBalance
    ? tradeErrors.insufficientBalance
    : undefined;

  if (inputAmount?.token.tokenType === 'PrimeCash' && !marketIndex) {
    errorMsg = tradeErrors.selectMaturityToCompleteTrade;
  }

  const tokenIndexOut =
    inputAmount?.token.tokenType === 'PrimeCash' ? marketIndex : 0;

  // If we have a selected market then we can update the cash and fCash sides
  // of the trade. If not, show the error.
  let netCashAmount: TokenBalance | undefined;
  let netfCashAmount: TokenBalance | undefined;
  let fee: TokenBalance | undefined;
  if (fCashMarket && inputAmount && !inputAmount.isZero() && tokenIndexOut) {
    try {
      const { tokensOut, feesPaid } = fCashMarket.calculateTokenTrade(
        inputAmount,
        tokenIndexOut
      );

      if (tokensOut.isZero()) {
        errorMsg = tradeErrors.insufficientLiquidity;
      } else {
        fee = feesPaid[0];
        netCashAmount =
          tokensOut.token.tokenType === 'PrimeCash' ? tokensOut : inputAmount;
        netfCashAmount =
          tokensOut.token.tokenType === 'fCash' ? tokensOut : inputAmount;
      }
    } catch (e) {
      errorMsg = tradeErrors.insufficientLiquidity;
    }
  }

  return {
    inputAmount,
    inputString,
    errorMsg,
    netCashAmount,
    netfCashAmount,
    maxBalance,
    maxBalanceString,
    fee,
    setInputString,
  };
}
