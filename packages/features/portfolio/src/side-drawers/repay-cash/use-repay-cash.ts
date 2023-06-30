import {
  useNotional,
  useRiskRatios,
  useAccount,
} from '@notional-finance/notionable-hooks';
import { TypedBigNumber } from '@notional-finance/sdk';
import { TradePropertyKeys, TransactionData } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import { useEffect } from 'react';

interface RepayCashState {
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  selectedToken: string | null;
}

const initialRepayCashState = {
  hasError: false,
  inputAmount: undefined,
  selectedToken: null,
};

export function useRepayCash(
  symbol: string | undefined,
  assetKey: string | undefined
) {
  const { notional } = useNotional();
  const { address, accountDataCopy, assetSummary } = useAccount();
  const [state, updateRepayCashState] = useFormState<RepayCashState>(
    initialRepayCashState
  );
  const { hasError, inputAmount, selectedToken } = state;
  const selectedAsset = assetKey ? assetSummary.get(assetKey) : undefined;
  const defaultSymbol = symbol || selectedAsset?.underlyingSymbol;
  const {
    id: currencyId,
    isUnderlying,
    assetSymbol,
  } = {
    id: undefined,
    isUnderlying: true,
    assetSymbol: undefined,
  };
  const availableTokens = [] as string[];
  const cashBalance = undefined as TypedBigNumber | undefined;

  useEffect(() => {
    // This should only run once after initialization or if the route changes
    if (symbol) updateRepayCashState({ selectedToken: symbol });
  }, [symbol, updateRepayCashState]);

  let defaultRepaymentAssetCash: TypedBigNumber | undefined;
  if (assetSymbol) {
    defaultRepaymentAssetCash = TypedBigNumber.fromBalance(
      0,
      assetSymbol,
      true
    );
    if (cashBalance?.isNegative()) {
      defaultRepaymentAssetCash = defaultRepaymentAssetCash.add(
        cashBalance.toAssetCash().neg()
      );
    }
    if (selectedAsset?.fCash) {
      defaultRepaymentAssetCash = defaultRepaymentAssetCash.add(
        selectedAsset.fCash.notional.neg().toAssetCash(true)
      );
    }
  }

  if (inputAmount && currencyId) {
    accountDataCopy.updateBalance(currencyId, inputAmount.toAssetCash(true));
  }
  const {
    loanToValue: updatedLoanToValue,
    collateralRatio: updatedCollateralRatio,
  } = useRiskRatios(accountDataCopy);

  const canSubmit =
    !!notional && !!address && !!inputAmount && hasError === false;

  let transactionData: TransactionData | undefined = undefined;
  if (canSubmit) {
    transactionData = {
      transactionHeader: '',
      buildTransactionCall: {
        transactionFn: notional.deposit,
        transactionArgs: [
          address,
          selectedToken,
          inputAmount,
          false, // settle assets
        ],
      },
      transactionProperties: {
        [TradePropertyKeys.deposit]: inputAmount,
        [TradePropertyKeys.collateralRatio]:
          updatedCollateralRatio ?? undefined,
        [TradePropertyKeys.loanToValue]: updatedLoanToValue ?? undefined,
      },
    };
  }

  return {
    selectedToken: selectedToken || defaultSymbol,
    availableTokens,
    canSubmit,
    updatedAccountData: canSubmit ? accountDataCopy : undefined,
    transactionData,
    defaultRepaymentAmount: isUnderlying
      ? defaultRepaymentAssetCash
          ?.toUnderlying()
          .toExternalPrecision()
          .toExactString()
      : defaultRepaymentAssetCash?.toExternalPrecision().toExactString(),
    updateRepayCashState,
  };
}
