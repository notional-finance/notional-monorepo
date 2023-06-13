import { StakedNote } from '@notional-finance/sdk/src/staking';
import { tradeErrors } from '@notional-finance/trade';
import { useObservableState } from 'observable-hooks';
import { accountCoolDown$, sNoteAmount$ } from './unstake-manager';

export const useUnstakeAction = () => {
  const accountCoolDown = useObservableState(accountCoolDown$);
  const sNoteAmount = useObservableState(sNoteAmount$);
  const insufficientBalance = true;
  const maxSNoteAmount = sNoteAmount?.copy(0);
  // const { insufficientBalance, maxBalance: maxSNoteAmount } =
  //   useWalletBalanceInputCheck(sNoteAmount);

  const balanceError =
    insufficientBalance === true ? tradeErrors.insufficientBalance : undefined;
  const maxRedemptionValue = undefined;
  // maxSNoteAmount && StakedNote.getRedemptionValue(maxSNoteAmount);
  const redemptionValue = sNoteAmount
    ? StakedNote.getRedemptionValue(sNoteAmount)
    : maxRedemptionValue;
  const canSubmit = !!sNoteAmount && !balanceError;

  const isInCoolDown = accountCoolDown?.isInCoolDown ?? false;
  const isInRedeemWindow = accountCoolDown?.isInRedeemWindow ?? false;
  const redeemWindowBegin = accountCoolDown?.redeemWindowEnd;
  const redeemWindowEnd = accountCoolDown?.redeemWindowBegin;
  const sNOTERedemptionAmount = sNoteAmount || maxSNoteAmount;
  const sNOTERedeemUSDValue = redemptionValue?.ethClaim
    .toUSD()
    .add(redemptionValue?.noteClaim.toUSD());

  return {
    maxSNoteAmount,
    sNoteAmount,
    sNoteAmountError: balanceError,
    sNOTERedemptionAmount,
    redemptionValue,
    canSubmit,
    isInCoolDown,
    isInRedeemWindow,
    redeemWindowBegin,
    redeemWindowEnd,
    sNOTERedeemUSDValue,
    accountCoolDown,
  };
};
