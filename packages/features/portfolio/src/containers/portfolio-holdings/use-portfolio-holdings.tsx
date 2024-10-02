import { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  DataTableColumn,
  MultiValueCell,
  ChevronCell,
} from '@notional-finance/mui';
import { TotalEarningsTooltip } from '../../components';
import {
  usePendingPnLCalculation,
  useLeverageBlock,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { ExpandedState } from '@tanstack/react-table';
import { useDetailedHoldingsTable } from './use-detailed-holdings';
import { useGroupedHoldingsTable } from './use-grouped-holdings';
import { Box, useTheme } from '@mui/material';

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

export function usePortfolioHoldings() {
  const theme = useTheme();
  const isBlocked = useLeverageBlock();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
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
    <Box
      key="default"
      sx={{
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'center',
        width: theme.spacing(11),
      }}
    >
      <FormattedMessage defaultMessage="Default" />
    </Box>,
    <Box
      key="detailed"
      sx={{
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'center',
        width: theme.spacing(11),
      }}
    >
      <FormattedMessage defaultMessage="Detailed" />
    </Box>,
  ];

  const Columns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: <FormattedMessage defaultMessage="Asset" />,
        cell: MultiValueIconCell,
        accessorKey: 'asset',
        textAlign: 'left',
        expandableTable: true,
        width: theme.spacing(37.5),
      },
      {
        header: <FormattedMessage defaultMessage="Market APY" />,
        cell: MultiValueCell,
        accessorKey: 'marketApy',
        fontWeightBold: true,
        textAlign: 'right',
        expandableTable: true,
        width: theme.spacing(25),
      },
      {
        header: <FormattedMessage defaultMessage="Amount Paid" />,
        cell: MultiValueCell,
        accessorKey: 'amountPaid',
        fontWeightBold: true,
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
      },
      {
        header: <FormattedMessage defaultMessage="Present Value" />,
        cell: MultiValueCell,
        accessorKey: 'presentValue',
        fontWeightBold: true,
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total Earnings" />,
        cell: MultiValueCell,
        ToolTip: TotalEarningsTooltip,
        accessorKey: 'earnings',
        textAlign: 'right',
        fontWeightBold: true,
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
      {
        header: '',
        cell: ChevronCell,
        accessorKey: 'chevron',
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

  return {
    portfolioHoldingsColumns: Columns,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: !isBlocked && groupedRows.length > 0,
    },
    portfolioHoldingsData: insertDebtDivider(portfolioHoldingsData),
    pendingTokenData,
    setExpandedRows,
    initialState,
  };
}
