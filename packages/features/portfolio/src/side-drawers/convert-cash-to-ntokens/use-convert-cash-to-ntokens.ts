import { TypedBigNumber } from '@notional-finance/sdk';
import { useFormState } from '@notional-finance/utils';
import { tradeErrors, TransactionData } from '@notional-finance/trade';
import { TradePropertyKeys } from '@notional-finance/trade';
import {
  useNotional,
  useAccountCashBalance,
  useCurrencyData,
  useAccount,
} from '@notional-finance/notionable-hooks';
import { MessageDescriptor } from 'react-intl';

interface CashToNTokensState {
  inputAmount: TypedBigNumber | undefined;
  netCashChange: TypedBigNumber | undefined;
  netNTokenChange: TypedBigNumber | undefined;
  selectedToken: string;
  hasError: boolean;
  currencyId: number;
}

const initialCashToNTokensState = {
  hasError: false,
  inputAmount: undefined,
  currencyId: 0,
  netCashChange: undefined,
  netNTokenChange: undefined,
  selectedToken: '',
};

export function useConvertCashToNTokensInput(
  selectedToken: string,
  inputString: string
) {
  const { notional } = useNotional();
  const maxBalance = useAccountCashBalance(selectedToken);
  const maxValue = maxBalance?.toExactString();
  const { id } = useCurrencyData(selectedToken);

  const inputAmount =
    inputString && notional
      ? notional.parseInput(inputString, selectedToken, true)
      : undefined;

  let errorMsg: MessageDescriptor | undefined;
  if (maxBalance && inputAmount?.lte(maxBalance) === false) {
    errorMsg = tradeErrors.insufficientBalance;
  } else if (inputAmount === undefined) {
    errorMsg = undefined;
  }

  return {
    inputAmount,
    maxValue: maxValue,
    currencyId: id,
    errorMsg,
  };
}

export function useConvertCashToNTokens(symbol: string | undefined) {
  const { notional } = useNotional();
  const { address, accountDataCopy } = useAccount();
  const [state, updateCashToNTokensState] = useFormState<CashToNTokensState>(
    initialCashToNTokensState
  );

  const { hasError, currencyId, inputAmount, netCashChange, netNTokenChange } =
    state;

  const canSubmit =
    !!symbol &&
    !!notional &&
    !!address &&
    !!inputAmount &&
    !!netCashChange &&
    !!netNTokenChange &&
    hasError === false &&
    inputAmount?.isPositive();

  let transactionData: TransactionData | undefined;
  if (canSubmit) {
    accountDataCopy.updateBalance(currencyId, netCashChange, netNTokenChange);
    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: notional.mintNToken,
        transactionArgs: [address, symbol, inputAmount, true],
      },
      transactionProperties: {
        [TradePropertyKeys.nTokensMinted]: netNTokenChange,
        [TradePropertyKeys.fromCashBalance]: inputAmount,
      },
    };
  }

  return {
    canSubmit,
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    transactionData,
    updateCashToNTokensState,
  };
}
