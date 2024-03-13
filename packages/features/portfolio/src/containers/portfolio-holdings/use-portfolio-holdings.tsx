import { useState, useEffect, useMemo } from 'react';
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
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useDetailedHoldingsTable } from './use-detailed-holdings';
import { useGroupedHoldingsTable } from './use-grouped-holdings';
import { useTheme } from '@mui/material';

export function usePortfolioHoldings() {
  const theme = useTheme();
  const isBlocked = useLeverageBlock();
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const [toggleOption, setToggleOption] = useState<number>(0);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const { detailedHoldings } = useDetailedHoldingsTable();
  const { groupedRows, groupedTokens } = useGroupedHoldingsTable();

  const filteredHoldings = detailedHoldings.filter(
    ({ tokenId }) => !groupedTokens.includes(tokenId)
  );

  const groupedHoldings = [...groupedRows, ...filteredHoldings];

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

  const Columns = useMemo(
    () => [
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
        showGreenText: true,
      },
      {
        Header: '',
        Cell: ChevronCell,
        accessor: 'chevron',
        textAlign: 'left',
        expandableTable: true,
      },
    ],
    [theme]
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
  }, [expandedRows, setExpandedRows, Columns]);

  const portfolioHoldingsData =
    toggleOption === 0 && !isBlocked && groupedRows.length > 0
      ? groupedHoldings
      : detailedHoldings;

  function insertDebtDivider(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].asset.label.includes('Borrow')) {
        arr.splice(i, 0, {
          asset: {
            symbol: '',
            symbolBottom: '',
            label: 'DEBT POSITIONS',
            caption: '',
          },
          marketApy: {
            data: [
              {
                displayValue: '',
                isNegative: false,
              },
            ],
          },
          amountPaid: '',
          presentValue: '',
          earnings: '',
          toolTipData: undefined,
          actionRow: undefined,
          tokenId: ' ',
          isTotalRow: true,
          isDividerRow: true,
        });
        break;
      }
    }
    return arr;
  }

  return {
    portfolioHoldingsColumns: Columns,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: !isBlocked && groupedRows.length > 0,
    },
    portfolioHoldingsData: insertDebtDivider(portfolioHoldingsData).sort(
      (a, b) => a.sortOrder - b.sortOrder
    ),
    pendingTokenData,
    setExpandedRows,
    initialState,
  };
}
