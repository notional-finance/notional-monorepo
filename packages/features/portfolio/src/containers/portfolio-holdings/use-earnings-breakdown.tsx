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
  usePortfolioHoldings,
  useFiat,
  useGroupedHoldings,
} from '@notional-finance/notionable-hooks';
import { formatTokenType } from '@notional-finance/helpers';
import { formatCaption } from './use-grouped-holdings';

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

export function useEarningsBreakdown(isGrouped: boolean) {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const network = useSelectedNetwork();
  const baseCurrency = useFiat();
  const holdings = usePortfolioHoldings(network);
  const groupedHoldings = useGroupedHoldings(network) || [];

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
        // ToolTip: TotalEarningsTooltip,
        accessorKey: 'incentivesEarnings',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
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
  const groupedEarnings = groupedHoldings.map(
    ({
      asset: {
        balance: asset,
        perIncentiveEarnings,
        totalIncentiveEarnings,
        totalEarningsWithIncentives,
      },
      debt: { balance: debt },
      totalInterestAccrual,
      totalILAndFees,
      marketProfitLoss,
    }) => {
      const { icon } = formatTokenType(asset.token);
      const debtData = formatTokenType(debt.token);
      const underlying = asset.underlying;

      return {
        asset: {
          symbol: icon,
          symbolBottom: debtData?.icon,
          label:
            asset.tokenType === 'nToken'
              ? `Leveraged ${underlying.symbol} Liquidity`
              : `Leveraged ${underlying.symbol} Lend`,
          caption: formatCaption(asset, debt) || '',
        },
        incentivesEarnings: totalIncentiveEarnings
          ? totalIncentiveEarnings
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, true, 'en-US', true)
          : '0',
        toolTipData:
          perIncentiveEarnings.length > 0
            ? {
                perAssetEarnings: perIncentiveEarnings?.map((i) => ({
                  underlying: i.toDisplayStringWithSymbol(2),
                  baseCurrency: i
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2),
                })),
              }
            : undefined,
        accruedInterest:
          totalInterestAccrual
            ?.toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, true, 'en-US', true) || '0',
        marketPNL:
          marketProfitLoss
            ?.toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, true, 'en-US', true) || '0',
        feesPaid:
          totalILAndFees
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, true, 'en-US', true) || '0',
        totalEarnings:
          totalEarningsWithIncentives
            ?.toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false, 'en-US', true) || '0',
      };
    }
  );

  const detailedEarnings = holdings
    .map(
      ({
        balance: b,
        statement,
        perIncentiveEarnings,
        totalIncentiveEarnings,
        totalEarningsWithIncentives,
        marketProfitLoss,
      }) => {
        const isDebt = b.isNegative();
        const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
          b.token,
          isDebt
        );

        return {
          asset: {
            symbol: icon,
            symbolBottom: '',
            label: formattedTitle,
            caption: titleWithMaturity,
          },
          isDebt,
          tokenId: b.tokenId,
          incentivesEarnings: totalIncentiveEarnings
            ? totalIncentiveEarnings
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, true, 'en-US', true)
            : '0',
          toolTipData:
            perIncentiveEarnings.length > 0
              ? {
                  perAssetEarnings: perIncentiveEarnings?.map((i) => ({
                    underlying: i.toDisplayStringWithSymbol(2),
                    baseCurrency: i
                      .toFiat(baseCurrency)
                      .toDisplayStringWithSymbol(2),
                  })),
                }
              : undefined,
          accruedInterest:
            statement?.totalInterestAccrual
              ?.toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, true, 'en-US', true) || '0',
          marketPNL:
            marketProfitLoss
              ?.toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, true, 'en-US', true) || '0',
          feesPaid:
            statement?.totalILAndFees
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, true, 'en-US', true) || '0',
          totalEarnings:
            totalEarningsWithIncentives
              ?.toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false, 'en-US', true) || '0',
        };
      }
    )
    .sort((a, b) => {
      if (a.isDebt && !b.isDebt) {
        return 1;
      }
      if (!a.isDebt && b.isDebt) {
        return -1;
      }
      return 0;
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

  const groupedTokens = groupedHoldings.flatMap(({ asset, debt }) => [
    asset.balance.tokenId,
    debt.balance.tokenId,
  ]);

  const earningsBreakdownData = isGrouped
    ? [
        ...groupedEarnings,
        detailedEarnings.filter(
          ({ tokenId }) => !groupedTokens.includes(tokenId)
        ),
      ]
    : detailedEarnings;

  return {
    earningsBreakdownColumns: Columns,
    earningsBreakdownData: insertDebtDivider(earningsBreakdownData),
    setExpandedRows,
    initialState: { clickDisabled: true },
  };
}
