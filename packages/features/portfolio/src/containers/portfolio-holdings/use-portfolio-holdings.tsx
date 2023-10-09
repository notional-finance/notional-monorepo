import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  MultiValueCell,
  DisplayCell,
  ExpandedRows,
  ChevronCell,
} from '@notional-finance/mui';
import { usePendingPnLCalculation } from '@notional-finance/notionable-hooks';
import { useDetailedHoldings } from './use-detailed-holdings';
import { useGroupedHoldings } from './use-grouped-holdings';

export function usePortfolioHoldings() {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const pendingTokenData = usePendingPnLCalculation();

  const { totals, detailedHoldings } = useDetailedHoldings();
  const { groupedRows, groupedTokens } = useGroupedHoldings();
  const groupedHoldings = groupedRows.concat(
    detailedHoldings.filter(({ tokenId }) => !groupedTokens.includes(tokenId))
  );

  useEffect(() => {
    const formattedExpandedRows = Columns.reduce(
      (accumulator, _value, index) => {
        return { ...accumulator, [index]: index === 0 ? true : false };
      },
      {}
    );

    if (
      expandedRows === null &&
      JSON.stringify(formattedExpandedRows) !== '{}'
    ) {
      setExpandedRows(formattedExpandedRows);
    }
  }, [expandedRows, setExpandedRows]);

  return {
    portfolioHoldingsColumns: Columns,
    totals,
    groupedHoldings,
    detailedHoldings,
    pendingTokenData,
    setExpandedRows,
    initialState,
  };
}

const Columns = [
  {
    Header: <FormattedMessage defaultMessage="Asset" />,
    Cell: MultiValueIconCell,
    accessor: 'asset',
    textAlign: 'left',
    expandableTable: true,
  },
  {
    Header: <FormattedMessage defaultMessage="Market APY" />,
    Cell: MultiValueCell,
    accessor: 'marketApy',
    textAlign: 'right',
    expandableTable: true,
  },
  {
    Header: <FormattedMessage defaultMessage="Amount Paid" />,
    Cell: MultiValueCell,
    accessor: 'amountPaid',
    textAlign: 'right',
    expandableTable: true,
    showLoadingSpinner: true,
  },
  {
    Header: <FormattedMessage defaultMessage="Present Value" />,
    Cell: MultiValueCell,
    accessor: 'presentValue',
    textAlign: 'right',
    expandableTable: true,
  },
  {
    Header: <FormattedMessage defaultMessage="Total Earnings" />,
    Cell: DisplayCell,
    accessor: 'earnings',
    textAlign: 'right',
    expandableTable: true,
    showLoadingSpinner: true,
  },
  {
    Header: '',
    Cell: ChevronCell,
    accessor: 'chevron',
    textAlign: 'left',
    expandableTable: true,
  },
];
