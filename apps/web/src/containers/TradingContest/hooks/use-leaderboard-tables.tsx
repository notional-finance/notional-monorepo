import {
  ContestTableColumn,
  CustomIconCell,
  idCell,
} from '@notional-finance/mui';
import { Box } from '@mui/material';
import { useLeaderboardData } from './use-leaderboard-data';
import { colors } from '@notional-finance/styles';

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
      Cell: CustomIconCell,
      accessor: 'username',
      textAlign: 'left',
      width: '225px',
    },
    {
      Header: 'Total APY',
      accessor: 'totalAPY',
      textAlign: 'right',
      width: '225px',
    },
    {
      Header: 'Total Deposits',
      accessor: 'totalDeposits',
      Cell: ({
        cell: {
          value: { value, displayValue },
        },
      }) => (
        <Box sx={{ color: value < 100 ? colors.red : '' }}>{displayValue}</Box>
      ),
      textAlign: 'right',
      width: '225px',
    },
    {
      Header: 'Net Worth',
      accessor: 'netWorth',
      textAlign: 'right',
      width: '225px',
    },
    {
      Header: 'Total Earnings',
      accessor: 'totalEarnings',
      textAlign: 'right',
      width: '225px',
    },
  ];
  const {
    highRollerData,
    fatCatData,
    currentUserData,
    setHighRollerPartner,
    highRollerPartner,
    setFatCatPartner,
    fatCatPartner,
  } = useLeaderboardData();

  const currentUserColumns = leaderBoardColumns.filter(
    ({ accessor }) => accessor !== 'address'
  );

  return {
    leaderBoardColumns,
    currentUserData,
    currentUserColumns,
    highRollerData,
    fatCatData,
    setHighRollerPartner,
    highRollerPartner,
    setFatCatPartner,
    fatCatPartner,
  };
};
