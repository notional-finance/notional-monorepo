import {
  ContestTableColumn,
  customIconCell,
  idCell,
} from '@notional-finance/mui';
import { useLeaderboardData } from './use-leaderboard-data';

export const useCompactTables = () => {
  const tableColumns: ContestTableColumn[] = [
    {
      Header: '',
      accessor: 'rank',
      Cell: idCell,
      isIDCell: true,
      textAlign: 'center',
    },
    {
      Header: 'test',
      Cell: customIconCell,
      accessor: 'username',
      textAlign: 'left',
    },
    {
      Header: 'test',
      accessor: 'totalAPY',
      textAlign: 'right',
    },
  ];
  const { highRollerData, sadSackData, fatCatData } = useLeaderboardData();
  const tableDataOne = highRollerData.filter((_, i) => i < 5);
  const tableDataTwo = sadSackData.filter((_, i) => i < 5);
  const tableDataThree = fatCatData.filter((_, i) => i < 5);

  return { tableColumns, tableDataOne, tableDataTwo, tableDataThree };
};
