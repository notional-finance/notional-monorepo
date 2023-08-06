import {
  useAccountDefinition,
  useAccountReady,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { TableTitleButtonsType } from '@notional-finance/mui';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

export interface UserNoteData {
  userNoteEarnedPerSecond: number;
  userNoteEarnedFloat: number;
  userNoteEarned: BigNumber;
}

export const useClaimNote = () => {
  // const { account } = useAccount();
  const [noteData, setNoteData] = useState<UserNoteData>({
    userNoteEarnedPerSecond: 0,
    userNoteEarnedFloat: 0,
    userNoteEarned: BigNumber.from(0),
  });

  const fetchNoteData = useCallback(async () => {
    setNoteData({
      userNoteEarnedPerSecond: 0,
      userNoteEarnedFloat: 0,
      userNoteEarned: BigNumber.from(0),
    });
    // let userNoteEarnedPerSecond = 0;
    // let userNoteEarnedFloat = 0;
    // let userNoteEarned = BigNumber.from(0);
    // try {
    //   if (account) {
    //     const nowInSeconds = getNowSeconds();
    //     userNoteEarned = await account.fetchClaimableIncentives(
    //       account?.address
    //     );
    //     const userNoteEarnedPlus100 = await account.fetchClaimableIncentives(
    //       account.address,
    //       nowInSeconds + 100
    //     );
    //     if (userNoteEarned) {
    //       const perSecond = userNoteEarnedPlus100.sub(userNoteEarned).div(100);
    //       userNoteEarnedPerSecond = parseFloat(
    //         ethers.utils.formatUnits(perSecond, 8)
    //       );
    //       userNoteEarnedFloat = parseFloat(
    //         ethers.utils.formatUnits(userNoteEarned, 8)
    //       );
    //     }
    //   }
    //   setNoteData({
    //     userNoteEarnedPerSecond,
    //     userNoteEarnedFloat,
    //     userNoteEarned,
    //   });
    // } catch (e) {
    //   console.error(e);
    // }
  }, [setNoteData]);

  useEffect(() => {
    fetchNoteData();
  }, [fetchNoteData]);

  return { ...noteData, fetchNoteData };
};

export const usePortfolioButtonBar = () => {
  const accountReady = useAccountReady();
  const { pathname: currentPath } = useLocation();
  const { account } = useAccountDefinition();
  const hasWithdrawableTokens = !!account?.balances.find((t) => t.isPositive() && !t.isVaultToken)
  const hasDebts = !!account?.balances.find((t) => t.isNegative() && !t.isVaultToken)
  const history = useHistory();

  const buttonData: TableTitleButtonsType[] = [
    {
      buttonText: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DEPOSIT}/ETH`);
      },
    },
  ];

  if (hasWithdrawableTokens) {
    buttonData.push({
      buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.WITHDRAW}`);
      },
    });
  }

  if (hasDebts) {
    buttonData.push({
      buttonText: <FormattedMessage defaultMessage={'Deleverage'} />,
      callback: () => {
        history.push(`${currentPath}/${PORTFOLIO_ACTIONS.DELEVERAGE}`);
      },
    });
  }

  return accountReady ? buttonData : [];
};
