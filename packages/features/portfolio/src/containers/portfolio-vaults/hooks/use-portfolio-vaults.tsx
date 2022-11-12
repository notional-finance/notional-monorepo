import { useTheme } from '@mui/material';
import {
  ExpandableCurrencyCell,
  ChevronCell,
  ExpandedRows,
  MultiValueCell,
  SliderCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { useYieldStrategies } from '@notional-finance/notionable-hooks';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
} from '@notional-finance/helpers';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { useEffect, useMemo, useState } from 'react';

export const usePortfolioVaults = () => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows | null>(null);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const vaults = useYieldStrategies(true);
  const theme = useTheme();

  const vaultSummaryColumns: DataTableColumn[] = useMemo(() => {
    return [
      {
        Header: '',
        expandableTable: true,
        Cell: ChevronCell,
        accessor: 'chevron',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Vault"
            description={'Vault header'}
          />
        ),
        expandableTable: true,
        Cell: ExpandableCurrencyCell,
        accessor: 'vault',
        textAlign: 'left',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Maturity"
            description={'Maturity header'}
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'maturity',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Net Worth"
            description={'Net Worth header'}
          />
        ),
        expandableTable: true,
        Cell: MultiValueCell,
        accessor: 'netWorth',
        textAlign: 'right',
      },
      {
        Header: (
          <FormattedMessage
            defaultMessage="Leverage"
            description={'Leverage header'}
          />
        ),
        expandableTable: true,
        Cell: SliderCell,
        accessor: 'leveragePercentage',
        textAlign: 'right',
      },
    ];
  }, []);

  const vaultSummaryData = vaults.map((v) => {
    let trackColor: string | undefined;
    if (v.leveragePercentage) {
      trackColor =
        v.leveragePercentage > 90
          ? theme.palette.error.main
          : v.leveragePercentage > 70
          ? theme.palette.warning.main
          : undefined;
    }

    return {
      vault: {
        symbol: v.currencySymbol,
        label: v.strategyName,
      },
      maturity: {
        data: [
          moment.unix(v.maturity || 0).format('MMM DD YYYY'),
          moment.unix(v.maturity || 0).format('hh:mm A'),
        ],
      },
      netWorth: formatCryptoWithFiat(v.netWorth),
      leveragePercentage: {
        value: v.leveragePercentage,
        captionLeft: formatLeverageRatio(v.leverageRatio || 0, 1),
        captionRight: `Max: ${formatLeverageRatio(v.maxLeverageRatio || 0, 1)}`,
        trackColor,
      },
      actionRow: {
        maturity: v.maturity ? moment.unix(v.maturity).format() : undefined,
        routes: v.routes,
      },
    };
  });

  useEffect(() => {
    const formattedExpandedRows = vaultSummaryData.reduce(
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
  }, [vaultSummaryData, expandedRows, setExpandedRows]);

  return {
    vaultSummaryColumns,
    vaultSummaryData,
    setExpandedRows,
    initialState,
  };
};
