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
      header: '',
      accessorKey: 'rank',
      cell: idCell,
      isIDcell: true,
      textAlign: 'center',
      width: '76px',
    },
    {
      header: '',
      cell: CustomIconCell,
      accessorKey: 'username',
      textAlign: 'left',
      width: '225px',
    },
    {
      header: 'Total APY',
      accessorKey: 'totalAPY',
      textAlign: 'right',
      width: '225px',
    },
    {
      header: 'Total Deposits',
      accessorKey: 'totalDeposits',
      textAlign: 'right',
      width: '225px',
    },
    {
      header: 'Net Worth',
      accessorKey: 'netWorth',
      cell: ({
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
      header: 'Total Earnings',
      accessorKey: 'totalEarnings',
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
    ({ accessorKey }) => accessorKey !== 'address'
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
