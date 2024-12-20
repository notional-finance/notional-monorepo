import { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  DataTableColumn,
  MultiValueCell,
} from '@notional-finance/mui';
import { ExpandedState } from '@tanstack/react-table';
import { useTheme } from '@mui/material';
import {
  useAppStore,
  useSelectedNetwork,
  useTotalVaultHoldings,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  formatCryptoWithFiat,
  formatNumberAsAbbr,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
} from '@notional-finance/util';
import { FiatSymbols } from '@notional-finance/core-entities';

function insertVaultDivider(arr) {
  const result = arr;
  let vaultName = '';

  for (let i = 0; i < arr.length; i++) {
    const data = arr[i];
    if (vaultName !== data.vaultName) {
      result.splice(i, 0, {
        vault: {
          symbol: '',
          symbolBottom: '',
          label: data.vaultName,
          caption: '',
        },
        accruedInterest: '',
        marketPNL: '',
        feesPaid: '',
        totalEarnings: '',
        isTotalRow: true,
        isDividerRow: true,
      });
      vaultName = data.vaultName;
    }
  }
  return result;
}

export function useVaultEarnings(isGrouped: boolean) {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const network = useSelectedNetwork();
  const { baseCurrency } = useAppStore();
  const vaults = useVaultHoldings(network);
  const totalVaultHoldings = useTotalVaultHoldings(network);

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
        cell: MultiValueCell,
        // ToolTip: TotalEarningsTooltip,
        accessorKey: 'accruedInterest',
        textAlign: 'right',
        expandableTable: true,
        fontWeightBold: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
      {
        header: <FormattedMessage defaultMessage="Market PNL" />,
        cell: MultiValueCell,
        accessorKey: 'marketPNL',
        textAlign: 'right',
        fontWeightBold: true,
        expandableTable: true,
        showGreenText: true,
      },
      {
        header: <FormattedMessage defaultMessage="Fees Paid" />,
        cell: MultiValueCell,
        accessorKey: 'feesPaid',
        textAlign: 'right',
        expandableTable: true,
        fontWeightBold: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total Earnings" />,
        cell: MultiValueCell,
        accessorKey: 'totalEarnings',
        textAlign: 'right',
        fontWeightBold: true,
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
    ],
    [theme]
  );

  const earningsBreakdownData = isGrouped
    ? (vaults ?? []).map(
        ({
          underlying,
          name,
          maturity,
          totalInterestAccrual,
          totalILAndFees,
          marketProfitLoss,
          profit,
        }) => {
          return {
            vault: {
              symbol: formatTokenType(underlying).icon,
              label: name,
              caption:
                maturity === PRIME_CASH_VAULT_MATURITY
                  ? 'Open Term'
                  : `Maturity: ${formatMaturity(maturity)}`,
            },
            accruedInterest: formatCryptoWithFiat(
              baseCurrency,
              totalInterestAccrual
            ),
            marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
            feesPaid: formatCryptoWithFiat(baseCurrency, totalILAndFees),
            totalEarnings: formatCryptoWithFiat(baseCurrency, profit),
            isDebt: true,
          };
        }
      )
    : // In the detailed view, break out the asset and debt earnings
      (vaults ?? []).flatMap(
        ({
          vaultDebt,
          underlying,
          name,
          maturity,
          assetMarketPnL,
          assetInterestAccrual,
          assetFeesPaid,
          assetEarnings,
          debtMarketPnL,
          debtInterestAccrual,
          debtFeesPaid,
          debtEarnings,
        }) => {
          const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
            vaultDebt.unwrapVaultToken().token,
            true
          );
          const vaultCell = {
            symbol: formatTokenType(underlying).icon,
            label: name,
            caption:
              maturity === PRIME_CASH_VAULT_MATURITY
                ? 'Open Term'
                : `Maturity: ${formatMaturity(maturity)}`,
          };

          return [
            // Vault Shares
            {
              vault: vaultCell,
              accruedInterest: {
                data: [
                  {
                    displayValue: assetInterestAccrual
                      ? assetInterestAccrual
                          ?.toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2)
                      : `${FiatSymbols[baseCurrency]}0.00`,
                    isNegative: false,
                  },
                  {
                    displayValue: '',
                    isNegative: false,
                  },
                ],
              },
              marketPNL: formatCryptoWithFiat(baseCurrency, assetMarketPnL),
              feesPaid: formatCryptoWithFiat(baseCurrency, assetFeesPaid),
              totalEarnings: {
                data: [
                  {
                    displayValue: assetEarnings
                      ? assetEarnings
                          ?.toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2)
                      : `${FiatSymbols[baseCurrency]}0.00`,
                    isNegative: false,
                  },
                  {
                    displayValue: '',
                    isNegative: false,
                  },
                ],
              },
              vaultName: name,
            },
            // Vault Debt
            {
              vault: {
                symbol: icon,
                symbolBottom: '',
                label: formattedTitle,
                caption: titleWithMaturity,
              },
              accruedInterest: {
                data: [
                  {
                    displayValue: debtInterestAccrual
                      ? debtInterestAccrual
                          ?.toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2)
                      : '-',
                    isNegative: debtInterestAccrual.isNegative(),
                  },
                  {
                    displayValue: '',
                    isNegative: false,
                  },
                ],
              },
              marketPNL: formatCryptoWithFiat(baseCurrency, debtMarketPnL),
              feesPaid: formatCryptoWithFiat(baseCurrency, debtFeesPaid),
              totalEarnings: {
                data: [
                  {
                    displayValue: debtEarnings
                      ? debtEarnings
                          ?.toFiat(baseCurrency)
                          .toDisplayStringWithSymbol(2)
                      : '-',
                    isNegative: debtEarnings.isNegative(),
                  },
                  {
                    displayValue: '',
                    isNegative: false,
                  },
                ],
              },
              vaultName: name,
              isDebt: true,
            },
          ];
        }
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

  const finalEarningsData = !isGrouped
    ? insertVaultDivider(earningsBreakdownData)
    : earningsBreakdownData;

  finalEarningsData.push({
    vault: {
      symbol: '',
      symbolBottom: '',
      label: 'Total',
      caption: '',
    },
    accruedInterest: {
      data: [
        {
          displayValue:
            totalVaultHoldings?.accruedInterest.toFloat() === 0
              ? '-'
              : formatNumberAsAbbr(
                  totalVaultHoldings?.accruedInterest.toFloat() || 0,
                  2,
                  baseCurrency
                ),
          isNegative: totalVaultHoldings?.accruedInterest.isNegative(),
        },
        {
          displayValue: '',
          isNegative: false,
        },
      ],
    },
    marketPNL: {
      data: [
        {
          displayValue:
            totalVaultHoldings?.marketPNL.toFloat() === 0
              ? '-'
              : formatNumberAsAbbr(
                  totalVaultHoldings?.marketPNL.toFloat() || 0,
                  2,
                  baseCurrency
                ),
          isNegative: totalVaultHoldings?.marketPNL.isNegative(),
        },
        {
          displayValue: '',
          isNegative: false,
        },
      ],
    },
    feesPaid: {
      data: [
        {
          displayValue:
            totalVaultHoldings?.feesPaid.toFloat() === 0
              ? '-'
              : formatNumberAsAbbr(
                  totalVaultHoldings?.feesPaid.toFloat() || 0,
                  2,
                  baseCurrency
                ),
          isNegative: totalVaultHoldings?.feesPaid.isNegative(),
        },
        {
          displayValue: '',
          isNegative: false,
        },
      ],
    },
    totalEarnings: {
      data: [
        {
          displayValue:
            totalVaultHoldings?.totalEarnings.toFloat() === 0
              ? '-'
              : formatNumberAsAbbr(
                  totalVaultHoldings?.totalEarnings.toFloat() || 0,
                  2,
                  baseCurrency
                ),
          isNegative: totalVaultHoldings?.totalEarnings.isNegative(),
        },
        {
          displayValue: '',
          isNegative: false,
        },
      ],
    },
    actionRow: undefined,
    tokenId: ' ',
    isTotalRow: true,
    isDebt: true,
  } as unknown as (typeof earningsBreakdownData)[number]);

  return {
    earningsBreakdownColumns: Columns,
    earningsBreakdownData: finalEarningsData,
    setExpandedRows,
    initialState: { clickDisabled: true },
  };
}
