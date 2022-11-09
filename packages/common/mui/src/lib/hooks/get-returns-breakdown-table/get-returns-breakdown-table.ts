import { ReturnsBreakdown } from '@notional-finance/sdk';
import { IconCell } from '../../data-table-cells';

export const getReturnsBreakdownTableData = (symbol: string, breakdown?: ReturnsBreakdown[]) => {
  if (!breakdown) return {};
  const valueHeading = `${symbol} Value`;
  const interestHeading = `${symbol} Interest Earned`;

  const tableColumns = [
    {
      Header: 'Source',
      accessor: 'Source',
      Cell: IconCell,
      textAlign: 'left',
    },
    {
      Header: 'Balance',
      accessor: 'Balance',
      textAlign: 'right',
    },
    {
      Header: valueHeading,
      accessor: valueHeading,
      textAlign: 'right',
    },
    {
      Header: interestHeading,
      accessor: interestHeading,
      textAlign: 'right',
    },
  ];

  const tableData = breakdown.map((b) => {
    return {
      Source: b.source,
      Balance: b.balance.toDisplayString(),
      [valueHeading]: b.value.toDisplayString(),
      [interestHeading]: b.interestEarned?.toDisplayString() || '',
      // 'Realized Return': `${balance.cTokenYieldDisplayString || '0.000%'} APY`
    };
  });

  return { tableData, tableColumns };
};
