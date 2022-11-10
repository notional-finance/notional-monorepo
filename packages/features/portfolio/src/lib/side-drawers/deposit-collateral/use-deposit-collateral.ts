import {
  useAccount,
  useCurrency,
  useNotional,
  useRiskRatios,
} from '@notional-finance/notionable-hooks';
import { TransactionData } from '@notional-finance/notionable';
import { CollateralAction } from '@notional-finance/sdk';
import { TradePropertyKeys } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';

interface DepositCollateralState {
  hasError: boolean;
  collateralAction: CollateralAction | undefined;
  collateralApy: number | undefined;
  collateralSymbol: string | undefined;
}

const initialDepositCollateralState = {
  hasError: false,
  collateralAction: undefined,
  collateralApy: undefined,
  collateralSymbol: undefined,
};

export function useDepositCollateral() {
  const [state, updateDepositCollateralState] = useFormState<DepositCollateralState>(
    initialDepositCollateralState
  );
  const { notional } = useNotional();
  const { allCurrencySymbols: availableTokens } = useCurrency();
  const { hasError, collateralAction, collateralApy, collateralSymbol } = state;
  const { accountDataCopy, address } = useAccount();
  const canSubmit =
    hasError === false &&
    !!collateralAction &&
    collateralAction.amount?.isPositive() === true &&
    !!notional &&
    !!address;

  if (collateralAction) accountDataCopy.updateCollateralAction(collateralAction);
  const { loanToValue: updatedLoanToValue, collateralRatio: updatedCollateralRatio } =
    useRiskRatios(accountDataCopy);

  let transactionData: TransactionData | undefined;
  if (canSubmit) {
    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: notional.depositCollateralAction,
        transactionArgs: [address, collateralAction],
      },
      transactionProperties: {
        [TradePropertyKeys.collateralRatio]: updatedCollateralRatio ?? undefined,
        [TradePropertyKeys.loanToValue]: updatedLoanToValue ?? 0,
        [TradePropertyKeys.collateralAPY]: collateralApy,
        [TradePropertyKeys.collateralDeposit]: collateralAction?.amount,
        [TradePropertyKeys.collateralType]: collateralSymbol,
      },
    };
  }

  return {
    availableTokens,
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    canSubmit,
    transactionData,
    updateDepositCollateralState,
  };
}
