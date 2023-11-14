import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  MultiValueCell,
  DisplayCell,
  ExpandedRows,
  ChevronCell,
} from '@notional-finance/mui';
import { TotalEarningsTooltip } from '../../components';
import {
  usePendingPnLCalculation,
  useLeverageBlock,
} from '@notional-finance/notionable-hooks';
import { useDetailedHoldings } from './use-detailed-holdings';
import { useGroupedHoldings } from './use-grouped-holdings';
import { useTheme } from '@mui/material';

export function usePortfolioHoldings() {
  const theme = useTheme();
  const isBlocked = useLeverageBlock();
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const [toggleOption, setToggleOption] = useState<number>(0);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const pendingTokenData = usePendingPnLCalculation();
  const { detailedHoldings } = useDetailedHoldings();
  const { groupedRows, groupedTokens } = useGroupedHoldings();

  const filteredHoldings = detailedHoldings.filter(
    ({ tokenId }) => !groupedTokens.includes(tokenId)
  );

  const groupedHoldings = [...groupedRows, ...filteredHoldings];

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

  const toggleData = [
    {
      id: 0,
      label: <FormattedMessage defaultMessage="Default" />,
    },
    {
      id: 1,
      label: <FormattedMessage defaultMessage="Detailed" />,
    },
  ];

  const Columns = [
    {
      Header: <FormattedMessage defaultMessage="Asset" />,
      Cell: MultiValueIconCell,
      accessor: 'asset',
      textAlign: 'left',
      expandableTable: true,
      width: theme.spacing(37.5),
    },
    {
      Header: <FormattedMessage defaultMessage="Market APY" />,
      Cell: MultiValueCell,
      accessor: 'marketApy',
      textAlign: 'right',
      expandableTable: true,
      width: theme.spacing(25),
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
      ToolTip: TotalEarningsTooltip,
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

  return {
    portfolioHoldingsColumns: Columns,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: !isBlocked && groupedRows.length > 0,
    },
    groupedHoldings: groupedHoldings.sort((a, b) => a.sortOrder - b.sortOrder),
    detailedHoldings: detailedHoldings.sort(
      (a, b) => a.sortOrder - b.sortOrder
    ),
    pendingTokenData,
    setExpandedRows,
    initialState,
  };
}
