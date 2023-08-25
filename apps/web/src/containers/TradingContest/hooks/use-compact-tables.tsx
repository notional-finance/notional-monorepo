import { ContestTableColumn } from '@notional-finance/mui';

export const useCompactTables = () => {
  const tableColumns: ContestTableColumn[] = [
    {
      Header: 'test',
      accessor: 'id',
      textAlign: 'left',
    },
    {
      Header: 'test',
      accessor: 'username',
      textAlign: 'left',
    },
    {
      Header: 'test',
      accessor: 'totalAPY',
      textAlign: 'right',
    },
  ];

  const tableDataOne = [
    {
      id: 1,
      username: 'John Doe',
      totalAPY: '63.21% APY',
    },
    {
      id: 2,
      username: 'Jane Doe',
      totalAPY: '44.17% APY',
    },
    {
      id: 3,
      username: 'Peter Smith',
      totalAPY: '98.73% APY',
    },
    {
      id: 4,
      username: 'Susan Jones',
      totalAPY: '19.04% APY',
    },
    {
      id: 5,
      username: 'Michael Brown',
      totalAPY: '55.38% APY',
    },
  ];
  const tableDataTwo = [
    {
      id: 1,
      username: 'John Doe',
      totalAPY: '63.21% APY',
    },
    {
      id: 2,
      username: 'Jane Doe',
      totalAPY: '44.17% APY',
    },
    {
      id: 3,
      username: 'Peter Smith',
      totalAPY: '98.73% APY',
    },
    {
      id: 4,
      username: 'Susan Jones',
      totalAPY: '19.04% APY',
    },
    {
      id: 5,
      username: 'Michael Brown',
      totalAPY: '55.38% APY',
    },
  ];
  const tableDataThree = [
    {
      id: 1,
      username: 'John Doe',
      totalAPY: '63.21% APY',
    },
    {
      id: 2,
      username: 'Jane Doe',
      totalAPY: '44.17% APY',
    },
    {
      id: 3,
      username: 'Peter Smith',
      totalAPY: '98.73% APY',
    },
    {
      id: 4,
      username: 'Susan Jones',
      totalAPY: '19.04% APY',
    },
    {
      id: 5,
      username: 'Michael Brown',
      totalAPY: '55.38% APY',
    },
  ];

  return { tableColumns, tableDataOne, tableDataTwo, tableDataThree };
};
