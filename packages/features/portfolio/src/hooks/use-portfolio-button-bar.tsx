import {
  useAccountReady,
  useAccountWithdrawableTokens,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { ButtonOptionsType } from '@notional-finance/mui';
import { BigNumber, ethers } from 'ethers';
import { useAccount } from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useState } from 'react';
import { getNowSeconds } from '@notional-finance/util';

export interface UserNoteData {
  userNoteEarnedPerSecond: number;
  userNoteEarnedFloat: number;
  userNoteEarned: BigNumber;
}

export const useClaimNote = () => {
  const { account } = useAccount();
  const [noteData, setNoteData] = useState<UserNoteData>({
    userNoteEarnedPerSecond: 0,
    userNoteEarnedFloat: 0,
    userNoteEarned: BigNumber.from(0),
  });

  const fetchNoteData = useCallback(async () => {
    let userNoteEarnedPerSecond = 0;
    let userNoteEarnedFloat = 0;
    let userNoteEarned = BigNumber.from(0);

    try {
      if (account) {
        const nowInSeconds = getNowSeconds();
        userNoteEarned = await account.fetchClaimableIncentives(
          account?.address
        );

        const userNoteEarnedPlus100 = await account.fetchClaimableIncentives(
          account.address,
          nowInSeconds + 100
        );

        if (userNoteEarned) {
          const perSecond = userNoteEarnedPlus100.sub(userNoteEarned).div(100);
          userNoteEarnedPerSecond = parseFloat(
            ethers.utils.formatUnits(perSecond, 8)
          );
          userNoteEarnedFloat = parseFloat(
            ethers.utils.formatUnits(userNoteEarned, 8)
          );
        }
      }

      setNoteData({
        userNoteEarnedPerSecond,
        userNoteEarnedFloat,
        userNoteEarned,
      });
    } catch (e) {
      console.error(e);
    }
  }, [account, setNoteData]);

  useEffect(() => {
    fetchNoteData();
  }, [fetchNoteData]);

  return { ...noteData, fetchNoteData };
};

export const usePortfolioButtonBar = () => {
  const accountReady = useAccountReady();
  const { pathname: currentPath } = useLocation();
  const withdrawableTokens = useAccountWithdrawableTokens();
  const history = useHistory();

  const buttonData: ButtonOptionsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}/ETH`);
      },
    },
  ];

  if (withdrawableTokens.length > 0) {
    buttonData.push({
      buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.WITHDRAW}`);
      },
    });
  }

  return accountReady ? buttonData : [];
};
