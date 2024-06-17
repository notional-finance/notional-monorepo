import { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  DataTableColumn,
  MultiValueCell,
  DisplayCell,
} from '@notional-finance/mui';
import { TotalEarningsTooltip } from '../../components';
import { ExpandedState } from '@tanstack/react-table';
import { useTheme } from '@mui/material';

// function insertDebtDivider(arr) {
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i].asset.label.includes('Borrow')) {
//       arr.splice(i, 0, {
//         asset: {
//           symbol: '',
//           symbolBottom: '',
//           label: 'DEBT POSITIONS',
//           caption: '',
//         },
//         marketApy: {
//           data: [
//             {
//               displayValue: '',
//               isNegative: false,
//             },
//           ],
//         },
//         amountPaid: '',
//         presentValue: '',
//         earnings: '',
//         toolTipData: undefined,
//         actionRow: undefined,
//         tokenId: ' ',
//         isTotalRow: true,
//         isDividerRow: true,
//       });
//       break;
//     }
//   }
//   return arr;
// }

export function useEarningsBreakdown() {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});

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
        header: <FormattedMessage defaultMessage="Incentives Earnings" />,
        cell: DisplayCell,
        ToolTip: TotalEarningsTooltip,
        accessorKey: 'incentivesEarnings',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
      {
        header: <FormattedMessage defaultMessage="Accrued Interest" />,
        cell: DisplayCell,
        ToolTip: TotalEarningsTooltip,
        accessorKey: 'accruedInterest',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
      {
        header: <FormattedMessage defaultMessage="Market PNL" />,
        cell: MultiValueCell,
        accessorKey: 'marketPNL',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Fees Paid" />,
        cell: MultiValueCell,
        accessorKey: 'feesPaid',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total Earnings" />,
        cell: DisplayCell,
        ToolTip: TotalEarningsTooltip,
        accessorKey: 'totalEarnings',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
    ],
    [theme]
  );

  const earningsBreakdownData = [
    {
      asset: {
        caption: 'nETH',
        label: 'ETH Liquidity',
        symbol: 'nETH',
        symbolBottom: '',
      },
      incentivesEarnings: '$50.37',
      accruedInterest: '$500',
      marketPNL: {
        data: [
          { displayValue: '+$250.10', isNegative: false },
          { displayValue: '7.73%', isNegative: false },
        ],
      },
      feesPaid: {
        data: [
          { displayValue: '0.1000 ETH', isNegative: false },
          { displayValue: '$382.51', isNegative: false },
        ],
      },
      totalEarnings: '$550.37',
    },
  ];

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

  return {
    earningsBreakdownColumns: Columns,
    earningsBreakdownData: earningsBreakdownData, // insertDebtDivider(earningsBreakdownData), TODO Add this when we get the real data
    setExpandedRows,
    initialState: { clickDisabled: true },
  };
}
