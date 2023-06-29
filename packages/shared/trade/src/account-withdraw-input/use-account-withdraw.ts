import { useAccount, useNotional } from '@notional-finance/notionable-hooks';
import { TypedBigNumber } from '@notional-finance/sdk';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { WITHDRAW_TYPE } from '@notional-finance/shared-config';
import { MessageDescriptor } from 'react-intl';
import { tradeErrors } from '../tradeErrors';

export function useAccountWithdraw(
  selectedToken: string,
  withdrawType: WITHDRAW_TYPE,
  inputString: string
) {
  const { notional } = useNotional();
  const { balanceSummary, accountDataCopy } = useAccount();
  const currencyId = 0;
  const isUnderlying = true;
  const inputAmount =
    inputString && notional
      ? notional.parseInput(inputString, selectedToken, true)
      : undefined;
  const balanceData = accountDataCopy?.accountBalances?.find(
    (b) => b.currencyId === currencyId
  );
  const selectedBalanceSummary = currencyId
    ? balanceSummary.get(currencyId)
    : undefined;
  let maxAmount: TypedBigNumber | undefined;
  let netCashBalance: TypedBigNumber | undefined;
  let netNTokenBalance: TypedBigNumber | undefined;
  let noteIncentivesMinted: TypedBigNumber | undefined;
  let redemptionFees: TypedBigNumber | undefined;
  let errorMsg: MessageDescriptor | undefined;

  try {
    if (withdrawType === WITHDRAW_TYPE.ONLY_CASH) {
      const maxAsset = selectedBalanceSummary?.maxWithdrawValueAssetCash;
      maxAmount = maxAsset
        ? TypedBigNumber.min(maxAsset, selectedBalanceSummary.assetCashBalance)
        : undefined;
      if (isUnderlying) maxAmount = maxAmount?.toUnderlying(true);
    } else if (withdrawType === WITHDRAW_TYPE.ONLY_NTOKEN) {
      const maxAsset = selectedBalanceSummary?.maxWithdrawValueAssetCash;
      const withdrawAmounts = maxAsset
        ? selectedBalanceSummary?.getWithdrawAmounts(maxAsset, false)
        : undefined;
      // If specifying only nTokens, then the input amount must also be specified
      // in nTokens.
      maxAmount = withdrawAmounts?.nTokenRedeem;
    } else if (withdrawType === WITHDRAW_TYPE.BOTH) {
      maxAmount = isUnderlying
        ? selectedBalanceSummary?.maxWithdrawValueAssetCash.toUnderlying(true)
        : selectedBalanceSummary?.maxWithdrawValueAssetCash;
    } else if (withdrawType === WITHDRAW_TYPE.REDEEM_TO_CASH) {
      // When redeeming nTokens to cash, the max amount is the total balance
      // because this will always increase the free collateral of the account
      maxAmount = selectedBalanceSummary?.nTokenBalance;
    }

    if (
      selectedBalanceSummary &&
      inputAmount &&
      maxAmount &&
      currencyId &&
      balanceData
    ) {
      if (withdrawType === WITHDRAW_TYPE.REDEEM_TO_CASH) {
        // Don't use get withdraw amounts here since cash is not leaving the system
        netCashBalance = NTokenValue.getAssetFromRedeemNToken(
          currencyId,
          inputAmount
        );
        netNTokenBalance = inputAmount.neg();
      } else if (inputAmount.lte(maxAmount)) {
        const withdrawAmounts = selectedBalanceSummary.getWithdrawAmounts(
          inputAmount.toAssetCash(),
          withdrawType === WITHDRAW_TYPE.ONLY_CASH // Prefer Cash
        );

        netCashBalance = withdrawAmounts?.cashWithdraw.neg();
        netNTokenBalance = withdrawAmounts.nTokenRedeem?.neg();
      } else {
        errorMsg = tradeErrors.insufficientBalance;
      }

      noteIncentivesMinted =
        netNTokenBalance && balanceData.nTokenBalance
          ? NTokenValue.getClaimableIncentives(
              currencyId,
              balanceData.nTokenBalance,
              balanceData.lastClaimTime,
              balanceData.accountIncentiveDebt
            )
          : undefined;
      redemptionFees = netNTokenBalance
        ? netNTokenBalance
            .neg()
            .toAssetCash(true)
            .sub(
              NTokenValue.getAssetFromRedeemNToken(
                currencyId,
                netNTokenBalance.neg()
              )
            )
        : undefined;
    }
  } catch (e) {
    errorMsg = {
      ...tradeErrors.errorCalculatingWithdraw,
      values: { e: (e as Error).message },
    } as MessageDescriptor;
  }

  return {
    inputAmount,
    errorMsg,
    maxAmount,
    maxAmountString: maxAmount?.toExactString(),
    netCashBalance,
    netNTokenBalance,
    noteIncentivesMinted,
    redemptionFees,
  };
}
