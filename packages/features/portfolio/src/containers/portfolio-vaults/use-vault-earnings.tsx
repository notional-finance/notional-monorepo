import { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  DataTableColumn,
  DisplayCell,
} from '@notional-finance/mui';
import { ExpandedState } from '@tanstack/react-table';
import { useTheme } from '@mui/material';
import {
  useSelectedNetwork,
  useFiat,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { formatTokenType } from '@notional-finance/helpers';
import {
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
} from '@notional-finance/util';

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

export function useVaultEarnings(isGrouped: boolean) {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const network = useSelectedNetwork();
  const baseCurrency = useFiat();
  const vaults = useVaultHoldings(network);

  const Columns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: <FormattedMessage defaultMessage="Vault" />,
        cell: MultiValueIconCell,
        accessorKey: 'vault',
        textAlign: 'left',
        expandableTable: true,
        width: theme.spacing(37.5),
      },
      // {
      //   header: <FormattedMessage defaultMessage="Incentives Earnings" />,
      //   cell: DisplayCell,
      //   // ToolTip: TotalEarningsTooltip,
      //   accessorKey: 'incentivesEarnings',
      //   textAlign: 'right',
      //   expandableTable: true,
      //   showLoadingSpinner: true,
      //   showGreenText: true,
      // },
      {
        header: <FormattedMessage defaultMessage="Accrued Interest" />,
        cell: DisplayCell,
        // ToolTip: TotalEarningsTooltip,
        accessorKey: 'accruedInterest',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
      {
        header: <FormattedMessage defaultMessage="Market PNL" />,
        cell: DisplayCell,
        accessorKey: 'marketPNL',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Fees Paid" />,
        cell: DisplayCell,
        accessorKey: 'feesPaid',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total Earnings" />,
        cell: DisplayCell,
        accessorKey: 'totalEarnings',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
    ],
    [theme]
  );

  const earningsBreakdownData = isGrouped
    ? vaults.map(
        ({
          vault: v,
          denom,
          totalInterestAccrual,
          totalILAndFees,
          marketProfitLoss,
          profit,
        }) => {
          return {
            vault: {
              symbol: formatTokenType(denom).icon,
              label: v.vaultConfig.name,
              caption:
                v.maturity === PRIME_CASH_VAULT_MATURITY
                  ? 'Open Term'
                  : `Maturity: ${formatMaturity(v.maturity)}`,
            },
            accruedInterest:
              totalInterestAccrual
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            marketPNL:
              marketProfitLoss
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            feesPaid:
              totalILAndFees
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            totalEarnings:
              profit
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
          };
        }
      )
    : vaults.flatMap(({ vault: v, denom, assetPnL, debtPnL }) => {
        const vaultCell = {
          symbol: formatTokenType(denom).icon,
          label: v.vaultConfig.name,
          caption:
            v.maturity === PRIME_CASH_VAULT_MATURITY
              ? 'Open Term'
              : `Maturity: ${formatMaturity(v.maturity)}`,
        };
        const assetMarketPnL = assetPnL?.totalProfitAndLoss.sub(
          assetPnL.totalInterestAccrual
        );
        const debtMarketPnL = debtPnL?.totalProfitAndLoss.sub(
          debtPnL.totalInterestAccrual
        );
        return [
          // Vault Shares
          {
            vault: vaultCell,
            accruedInterest:
              assetPnL?.totalInterestAccrual
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            marketPNL:
              assetMarketPnL
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            feesPaid:
              assetPnL?.totalILAndFees
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            totalEarnings:
              assetPnL?.totalProfitAndLoss
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
          },
          // Vault Debt
          {
            vault: vaultCell,
            accruedInterest:
              debtPnL?.totalInterestAccrual
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            marketPNL:
              debtMarketPnL
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            feesPaid:
              debtPnL?.totalILAndFees
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
            totalEarnings:
              debtPnL?.totalProfitAndLoss
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false, 'en-US', true) ||
              '0',
          },
        ];
      });

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
    earningsBreakdownData,
    setExpandedRows,
    initialState: { clickDisabled: true },
  };
}
