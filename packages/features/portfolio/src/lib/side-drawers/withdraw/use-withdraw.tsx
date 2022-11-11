import { useEffect } from 'react';
import {
  useNotional,
  useAccount,
  useCurrencyData,
  useRiskRatios,
  useAccountCashBalance,
  useAccountWithdrawableTokens,
} from '@notional-finance/notionable-hooks';
import {
  TransactionData,
  TransactionFunction,
} from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { TradePropertyKeys } from '@notional-finance/trade';
import { useFormState } from '@notional-finance/utils';
import { WITHDRAW_TYPE } from '@notional-finance/shared-config';

interface WithdrawState {
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  selectedToken: string;
  withdrawType: WITHDRAW_TYPE;
  netCashBalance: TypedBigNumber | undefined;
  netNTokenBalance: TypedBigNumber | undefined;
  noteIncentivesMinted: TypedBigNumber | undefined;
  redemptionFees: TypedBigNumber | undefined;
}

const initialWithdrawState = {
  inputAmount: undefined,
  hasError: false,
  selectedToken: '',
  withdrawType: WITHDRAW_TYPE.BOTH,
  netCashBalance: undefined,
  netNTokenBalance: undefined,
  noteIncentivesMinted: undefined,
  redemptionFees: undefined,
};

export function useWithdraw() {
  const [state, updateWithdrawState] =
    useFormState<WithdrawState>(initialWithdrawState);
  const { notional } = useNotional();
  const { address, accountDataCopy } = useAccount();
  const {
    selectedToken,
    hasError,
    inputAmount,
    withdrawType,
    netCashBalance,
    netNTokenBalance,
    noteIncentivesMinted,
    redemptionFees,
  } = state;
  const {
    id: currencyId,
    assetSymbol,
    isUnderlying,
  } = useCurrencyData(selectedToken);
  const assetCashBalance = useAccountCashBalance(assetSymbol);
  const availableTokens = useAccountWithdrawableTokens();

  const canSubmit =
    hasError === false &&
    inputAmount?.isPositive() === true &&
    inputAmount?.symbol === selectedToken &&
    !!notional &&
    !!address;

  let amountToWallet: TypedBigNumber | undefined;
  if (currencyId && assetSymbol && (netCashBalance || netNTokenBalance)) {
    accountDataCopy.updateBalance(currencyId, netCashBalance, netNTokenBalance);
    amountToWallet =
      netCashBalance?.neg() || TypedBigNumber.fromBalance(0, assetSymbol, true);
    if (netNTokenBalance)
      amountToWallet = amountToWallet.add(
        netNTokenBalance.neg().toAssetCash(true)
      );

    amountToWallet = isUnderlying
      ? amountToWallet.toUnderlying()
      : amountToWallet;
  } else if (selectedToken) {
    amountToWallet = TypedBigNumber.fromBalance(0, selectedToken, true);
  }

  const {
    loanToValue: updatedLoanToValue,
    collateralRatio: updatedCollateralRatio,
  } = useRiskRatios(accountDataCopy);
  const nTokensRedeemed = netNTokenBalance?.neg();

  let transactionData: TransactionData | undefined = undefined;
  if (canSubmit) {
    let buildTransactionCall: TransactionFunction;
    if (nTokensRedeemed?.isPositive() && assetSymbol) {
      const withdrawEntireCashBalance =
        /**
        NOTE: this was in the old logic, not clear if this is the correct behavior because
        it may result in reverts or unintentional undercollateralization
        isMaxSelected ||
        **/

        // If trying to withdraw ntokens without any cash balance then go ahead and withdraw
        // all the nTokens
        assetCashBalance?.isZero() ||
        // In this case the cash balance is strictly equal to everything and if there are nTokens
        // redeemed then they will also be withdrawn to wallet
        (netCashBalance &&
          assetCashBalance &&
          netCashBalance.neg().eq(assetCashBalance));

      const withdrawAmountInternalPrecision = withdrawEntireCashBalance
        ? TypedBigNumber.fromBalance(0, assetSymbol, true)
        : inputAmount.toAssetCash(true);

      buildTransactionCall = {
        transactionFn: notional.redeemNToken,
        transactionArgs: [
          address,
          currencyId,
          nTokensRedeemed,
          withdrawAmountInternalPrecision,
          withdrawEntireCashBalance,
          isUnderlying,
        ],
      };
    } else {
      buildTransactionCall = {
        transactionFn: notional.withdraw,
        transactionArgs: [address, selectedToken, inputAmount, isUnderlying],
      };
    }

    transactionData = {
      transactionHeader: '',
      buildTransactionCall,
      transactionProperties: {
        [TradePropertyKeys.amountToWallet]: amountToWallet,
        [TradePropertyKeys.nTokensRedeemed]: nTokensRedeemed?.isZero()
          ? undefined
          : nTokensRedeemed,
        [TradePropertyKeys.incentivesMinted]: noteIncentivesMinted?.isZero()
          ? undefined
          : noteIncentivesMinted,
        [TradePropertyKeys.nTokenRedeemSlippage]: redemptionFees?.isZero()
          ? undefined
          : isUnderlying
          ? redemptionFees?.toUnderlying()
          : redemptionFees,
        [TradePropertyKeys.collateralRatio]:
          updatedCollateralRatio ?? undefined,
        [TradePropertyKeys.loanToValue]: updatedLoanToValue ?? undefined,
      },
    };
  }

  useEffect(() => {
    if (!selectedToken && availableTokens.length) {
      updateWithdrawState({ selectedToken: availableTokens[0] });
    }
  }, [selectedToken, availableTokens, updateWithdrawState]);

  return {
    updatedAccountData: inputAmount?.isPositive() ? accountDataCopy : undefined,
    transactionData,
    canSubmit,
    withdrawType,
    availableTokens,
    selectedToken,
    sideDrawerInfo: {
      [TradePropertyKeys.amountToWallet]: amountToWallet,
      [TradePropertyKeys.nTokensRedeemed]: nTokensRedeemed?.isZero()
        ? undefined
        : nTokensRedeemed,
      [TradePropertyKeys.incentivesMinted]: noteIncentivesMinted?.isZero()
        ? undefined
        : noteIncentivesMinted,
    },
    updateWithdrawState,
  };
}
