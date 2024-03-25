import { useMemo, useEffect, useState } from 'react';
import { Theme, useTheme } from '@mui/material';
import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  SliderCell,
  ExpandedRows,
  ChevronCell,
  ArrowChangeCell,
} from '@notional-finance/mui';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import {
  useCurrentLiquidationPrices,
  useFiat,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  TXN_HISTORY_TYPE,
  formatMaturity,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { useHistory } from 'react-router-dom';

const vaultRiskTableColumns: DataTableColumn[] = [
  {
    Header: (
      <FormattedMessage
        defaultMessage="Exchange Rate"
        description={'column header'}
      />
    ),
    Cell: MultiValueIconCell,
    accessor: 'exchangeRate',
    textAlign: 'left',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Liquidation Price"
        description={'column header'}
      />
    ),
    accessor: 'liquidationPrice',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Current Price"
        description={'column header'}
      />
    ),
    accessor: 'currentPrice',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage defaultMessage="24H %" description={'column header'} />
    ),
    Cell: ArrowChangeCell,
    accessor: 'oneDayChange',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage defaultMessage="7D %" description={'column header'} />
    ),
    Cell: ArrowChangeCell,
    accessor: 'sevenDayChange',
    textAlign: 'right',
  },
];

export function getVaultLeveragePercentage(
  v: VaultAccountRiskProfile,
  theme: Theme
) {
  const maxLeverageRatio = v.maxLeverageRatio;
  const leverageRatio = v.leverageRatio();
  const leveragePercentage = leverageRatio
    ? (leverageRatio * 100) / maxLeverageRatio
    : null;
  let trackColor: string | undefined;

  if (leveragePercentage) {
    trackColor =
      leveragePercentage > 90
        ? theme.palette.error.main
        : leveragePercentage > 70
        ? theme.palette.warning.main
        : undefined;
  }

  return { maxLeverageRatio, leverageRatio, leveragePercentage, trackColor };
}

export const useVaultHoldingsTable = () => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const theme = useTheme();
  const baseCurrency = useFiat();
  const history = useHistory();
  const network = useSelectedNetwork();
  const { vaultLiquidation } = useCurrentLiquidationPrices(network);
  const vaults = useVaultHoldings(network);

  const vaultHoldingsColumns: DataTableColumn[] = useMemo(() => {
    return [
      {
        Header: (
          <FormattedMessage
            defaultMessage="Vault"
            description={'vault header'}
          />
        ),
        Cell: MultiValueIconCell,
        accessor: 'strategy',
        textAlign: 'left',
        expandableTable: true,
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Net Worth"
            description={'Net Worth header'}
          />
        ),
        Cell: MultiValueCell,
        accessor: 'netWorth',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Profits"
            description={'profits header'}
          />
        ),
        Cell: MultiValueCell,
        accessor: 'profit',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: (
          <FormattedMessage defaultMessage="APY" description={'Debts header'} />
        ),
        accessor: 'totalAPY',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Leverage Ratio"
            description={'currency header'}
          />
        ),
        Cell: SliderCell,
        accessor: 'leveragePercentage',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        Header: '',
        Cell: ChevronCell,
        accessor: 'chevron',
        textAlign: 'left',
        expandableTable: true,
      },
    ];
  }, []);

  const vaultHoldingsData = vaults.map(
    ({ vault: v, denom, profit, totalAPY, strategyAPY, borrowAPY }) => {
      const config = v.vaultConfig;
      const {
        leveragePercentage,
        leverageRatio,
        maxLeverageRatio,
        trackColor,
      } = getVaultLeveragePercentage(v, theme);

      const vaultRiskData = vaultLiquidation?.find(
        (b) => b.vaultAddress === v.vaultAddress
      );

      return {
        strategy: {
          symbol: formatTokenType(denom).icon,
          label: config.name,
          caption:
            v.maturity === PRIME_CASH_VAULT_MATURITY
              ? 'Open Term'
              : `Maturity: ${formatMaturity(v.maturity)}`,
        },
        // Assets and debts are shown on the overview page
        assets: formatCryptoWithFiat(baseCurrency, v.totalAssets()),
        debts: formatCryptoWithFiat(baseCurrency, v.totalDebt(), true),
        netWorth: formatCryptoWithFiat(baseCurrency, v.netWorth()),
        profit: formatCryptoWithFiat(baseCurrency, profit),
        totalAPY: totalAPY ? formatNumberAsPercent(totalAPY) : undefined,
        leveragePercentage: leveragePercentage
          ? {
              value: leveragePercentage,
              captionLeft: formatLeverageRatio(leverageRatio || 0, 1),
              captionRight: `Max: ${formatLeverageRatio(
                maxLeverageRatio || 0,
                1
              )}`,
              trackColor,
            }
          : undefined,
        // NOTE: these values are inside the accordion
        strategyAPY: {
          displayValue: formatNumberAsPercent(strategyAPY, 2),
          isNegative: strategyAPY && strategyAPY < 0,
        },
        borrowAPY: {
          displayValue: formatNumberAsPercent(borrowAPY, 2),
        },
        leverageRatio: formatLeverageRatio(v.leverageRatio() || 0),
        actionRow: {
          subRowData: [
            {
              label: <FormattedMessage defaultMessage={'Borrow APY'} />,
              value: formatNumberAsPercent(borrowAPY, 2),
            },
            {
              label: <FormattedMessage defaultMessage={'Strategy APY'} />,
              value: formatNumberAsPercent(strategyAPY, 2),
            },
            {
              label: <FormattedMessage defaultMessage={'Leverage Ratio'} />,
              value: formatLeverageRatio(v.leverageRatio() || 0),
            },
          ],
          buttonBarData: [
            {
              buttonText: <FormattedMessage defaultMessage={'Manage'} />,
              callback: () => {
                history.push(`/vaults/${network}/${v.vaultAddress}`);
              },
            },
            {
              buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
              callback: () => {
                history.push(
                  `/vaults/${network}/${v.vaultAddress}/WithdrawVault`
                );
              },
            },
          ],
          txnHistory: `/portfolio/${network}/transaction-history?${new URLSearchParams(
            {
              txnHistoryType: TXN_HISTORY_TYPE.LEVERAGED_VAULT,
              assetOrVaultId: config.vaultAddress,
            }
          )}`,
          riskTableData: vaultRiskData?.liquidationPrices,
          riskTableColumns: vaultRiskTableColumns,
        },
      };
    }
  );

  useEffect(() => {
    const formattedExpandedRows = vaultHoldingsColumns.reduce(
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
  }, [vaultHoldingsColumns, expandedRows, setExpandedRows]);

  return {
    vaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    initialState,
  };
};
