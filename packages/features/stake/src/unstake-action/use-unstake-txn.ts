import { useAccount } from '@notional-finance/notionable-hooks';
import { StakedNote } from '@notional-finance/sdk/src/staking';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { useUnstakeAction } from './use-unstake-action';
import { TradePropertyKeys } from '@notional-finance/trade';
import { messages } from '../messages';

export const useUnstakeTransaction = () => {
  const { account } = useAccount();
  const { sNoteAmount, accountCoolDown, redemptionValue } = useUnstakeAction();
  const { pathname: currentPath } = useLocation();
  if (!account) return undefined;

  if (accountCoolDown && currentPath.includes('start-cooldown')) {
    // START COOLDOWN
    const startDate = moment(accountCoolDown.redeemWindowBegin).format('LLL');
    const endDate = moment(accountCoolDown.redeemWindowEnd).format('LLL');

    return {
      buildTransactionCall: {
        transactionFn: StakedNote.startCoolDown,
        transactionArgs: [account.address],
      },
      transactionHeader: messages.unstake.startCoolDownConfirm,
      transactionProperties: {
        [TradePropertyKeys.redeemWindowBegins]: startDate,
        [TradePropertyKeys.redeemWindowEnds]: endDate,
      },
    };
  }

  if (currentPath.includes('end-cooldown')) {
    // END COOLDOWN
    return {
      buildTransactionCall: {
        transactionFn: StakedNote.stopCoolDown,
        transactionArgs: [account.address],
      },
      transactionHeader: messages.unstake.cancelCoolDownHeading,
      transactionProperties: {},
    };
  }

  if (currentPath.includes('end-redeem')) {
    // END REDEEM WINDOW
    return {
      buildTransactionCall: {
        transactionFn: StakedNote.stopCoolDown,
        transactionArgs: [account.address],
      },
      transactionHeader: messages.unstake.endRedemptionCTA,
      transactionProperties: {},
    };
  }

  if (redemptionValue && sNoteAmount && currentPath.includes('redeem-snote')) {
    // REDEEM CONFIRM
    return {
      buildTransactionCall: {
        transactionFn: StakedNote.redeem,
        transactionArgs: [sNoteAmount, account.address, false],
      },
      transactionHeader: messages.unstake.redeemCTA,
      transactionProperties: {
        [TradePropertyKeys.noteReceived]: redemptionValue.noteClaim,
        [TradePropertyKeys.ethReceived]: redemptionValue.ethClaim,
        [TradePropertyKeys.sNOTERedeemed]: sNoteAmount,
      },
    };
  }

  return undefined;
};
