import { useTheme } from '@mui/material';
import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  SliderCell,
} from '@notional-finance/mui';
import { useYieldStrategies } from '@notional-finance/notionable-hooks';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatMaturity,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';

export const useYieldHoldingsTable = () => {
  const yieldStrategies = useYieldStrategies(false);
  const theme = useTheme();
  const yieldHoldingsColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Strategy"
          description={'Currency header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'strategy',
      textAlign: 'left',
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
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Assets"
          description={'/assets header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'assets',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Debts" description={'Debts header'} />
      ),
      Cell: MultiValueCell,
      accessor: 'debts',
      textAlign: 'right',
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
    },
  ];

  const yieldHoldingsData = yieldStrategies.map((s) => {
    let trackColor: string | undefined;
    if (s.leveragePercentage) {
      trackColor =
        s.leveragePercentage > 90
          ? theme.palette.error.main
          : s.leveragePercentage > 70
          ? theme.palette.warning.main
          : undefined;
    }

    return {
      strategy: {
        symbol: s.currencySymbol,
        label: s.strategyName,
        caption: s.maturity
          ? `Maturity: ${formatMaturity(s.maturity)}`
          : undefined,
      },
      netWorth: formatCryptoWithFiat(s.netWorth),
      assets: formatCryptoWithFiat(s.assetValue),
      debts: formatCryptoWithFiat(s.debtValue),
      leveragePercentage: s.leveragePercentage
        ? {
            value: s.leveragePercentage,
            captionLeft: formatLeverageRatio(s.leverageRatio || 0, 1),
            captionRight: `Max: ${formatLeverageRatio(
              s.maxLeverageRatio || 0,
              1
            )}`,
            trackColor,
          }
        : undefined,
    };
  });

  return {
    yieldHoldingsColumns,
    yieldHoldingsData,
  };
};
