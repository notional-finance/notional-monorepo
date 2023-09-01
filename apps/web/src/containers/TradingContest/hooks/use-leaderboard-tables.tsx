import {
  ContestTableColumn,
  customIconCell,
  addressCell,
  idCell,
} from '@notional-finance/mui';
import { useLeaderboardData } from './use-leaderboard-data';

export const useLeaderBoardTables = () => {
  const leaderBoardColumns: ContestTableColumn[] = [
    {
      Header: '',
      accessor: 'rank',
      Cell: idCell,
      isIDCell: true,
      textAlign: 'center',
      width: '76px',
    },
    {
      Header: '',
      Cell: customIconCell,
      accessor: 'username',
      textAlign: 'left',
    },
    {
      Header: 'Total APY',
      accessor: 'totalAPY',
      textAlign: 'right',
    },
    // {
    //   Header: 'Leverage',
    //   accessor: 'leverage',
    //   textAlign: 'right',
    // },
    {
      Header: 'Total Deposits',
      accessor: 'totalDeposits',
      textAlign: 'right',
    },
    {
      Header: 'Net Worth',
      accessor: 'netWorth',
      textAlign: 'right',
    },
    {
      Header: 'Total Earnings',
      accessor: 'totalEarnings',
      textAlign: 'right',
    },
    {
      Header: 'View Portfolio',
      accessor: 'address',
      Cell: addressCell,
      textAlign: 'right',
    },
  ];
  const { highRollerData, sadSackData, fatCatData, currentUserData } =
    useLeaderboardData();

  const currentUserColumns = leaderBoardColumns.filter(
    ({ accessor }) => accessor !== 'address'
  );

  return {
    leaderBoardColumns,
    currentUserData,
    currentUserColumns,
    highRollerData,
    fatCatData,
    sadSackData,
  };
};
