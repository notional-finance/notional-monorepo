import { TypedBigNumber } from '@notional-finance/sdk';
import { useFormState } from '@notional-finance/utils';
import { TransactionData } from '@notional-finance/trade';
import { TradePropertyKeys } from '@notional-finance/trade';
import { useNotional, useAccount } from '@notional-finance/notionable-hooks';

interface WithdrawCashState {
  inputAmount: TypedBigNumber | undefined;
  netCashChange: TypedBigNumber | undefined;
  selectedToken: string;
  hasError: boolean;
  currencyId: number;
}

const initialWithdrawCashState = {
  hasError: false,
  inputAmount: undefined,
  currencyId: 0,
  netCashChange: undefined,
  selectedToken: '',
};

export function useWithdrawCash(symbol: string | undefined) {
  const { notional } = useNotional();
  const { address, accountDataCopy } = useAccount();
  const [state, updateWithdrawCashState] = useFormState<WithdrawCashState>(
    initialWithdrawCashState
  );

  const { hasError, currencyId, inputAmount, netCashChange } = state;

  const canSubmit =
    !!symbol &&
    !!notional &&
    !!address &&
    !!inputAmount &&
    !!netCashChange &&
    hasError === false &&
    inputAmount?.isPositive();

  let transactionData: TransactionData | undefined;
  if (canSubmit) {
    accountDataCopy.updateBalance(currencyId, netCashChange);
    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: notional.withdrawCash,
        transactionArgs: [address, symbol, inputAmount, true],
      },
      transactionProperties: {
        [TradePropertyKeys.fromCashBalance]: inputAmount,
        [TradePropertyKeys.amountToWallet]: inputAmount.toUnderlying(),
      },
    };
  }

  return {
    canSubmit,
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    transactionData,
    updateWithdrawCashState,
  };
}
