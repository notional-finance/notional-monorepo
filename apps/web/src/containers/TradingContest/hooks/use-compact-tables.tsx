import {
  ContestTableColumn,
  customIconCell,
  idCell,
} from '@notional-finance/mui';

export const useCompactTables = () => {
  const tableColumns: ContestTableColumn[] = [
    {
      Header: 'test',
      accessor: 'id',
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

  const tableDataOne = [
    {
      id: '01',
      username: { text: 'John Doe', dataSet: 'ace' },
      totalAPY: '63.21% APY',
    },
    {
      id: '02',
      username: { text: 'Susan Jones', dataSet: 'ace' },
      totalAPY: '44.17% APY',
    },
    {
      id: '03',
      username: { text: 'Peter Smith', dataSet: 'ace' },
      totalAPY: '98.73% APY',
    },
    {
      id: '04',
      username: { text: 'Susan Jones', dataSet: 'ace' },
      totalAPY: '19.04% APY',
    },
    {
      id: '05',
      username: { text: 'Michael Brown', dataSet: 'ace' },
      totalAPY: '55.38% APY',
    },
  ];
  const tableDataTwo = [
    {
      id: '01',
      username: { text: 'John Doe', dataSet: 'fatCat' },
      totalAPY: '63.21% APY',
    },
    {
      id: '02',
      username: { text: 'Jane Doe', dataSet: 'fatCat' },
      totalAPY: '44.17% APY',
    },
    {
      id: '03',
      username: { text: 'Peter Smith', dataSet: 'fatCat' },
      totalAPY: '98.73% APY',
    },
    {
      id: '04',
      username: { text: 'Susan Jones', dataSet: 'fatCat' },
      totalAPY: '19.04% APY',
    },
    {
      id: '05',
      username: { text: 'Michael Brown', dataSet: 'fatCat' },
      totalAPY: '55.38% APY',
    },
  ];
  const tableDataThree = [
    {
      id: '01',
      username: { text: 'John Doe', dataSet: 'sadSack' },
      totalAPY: '63.21% APY',
    },
    {
      id: '02',
      username: { text: 'Jane Doe', dataSet: 'sadSack' },
      totalAPY: '44.17% APY',
    },
    {
      id: '03',
      username: { text: 'Peter Smith', dataSet: 'sadSack' },
      totalAPY: '98.73% APY',
    },
    {
      id: '04',
      username: { text: 'Susan Jones', dataSet: 'sadSack' },
      totalAPY: '19.04% APY',
    },
    {
      id: '05',
      username: { text: 'Michael Brown', dataSet: 'sadSack' },
      totalAPY: '55.38% APY',
    },
  ];

  return { tableColumns, tableDataOne, tableDataTwo, tableDataThree };
};
