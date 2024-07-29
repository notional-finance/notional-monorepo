import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  ChartToolTipDataProps,
  ChartHeaderDataProps,
  AreaChartStylesProps,
  LEGEND_LINE_TYPES,
  CountUp,
} from '@notional-finance/mui';
import { RATE_PRECISION } from '@notional-finance/util';
import { useNotionalMarket } from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { TokenDefinition } from '@notional-finance/core-entities';

export const useInterestRateUtilizationChart = (
  deposit: TokenDefinition | undefined,
  actionType: string
) => {
  const theme = useTheme();
  const market = useNotionalMarket(deposit);

  const areaChartData = market
    ? Array(101)
        .fill(0)
        .map((_, i) => ({
          timestamp: i,
          area:
            actionType === 'borrow'
              ? (market.getPrimeDebtRate((i / 100) * RATE_PRECISION) * 100) /
                RATE_PRECISION
              : (market.getPrimeSupplyRate((i / 100) * RATE_PRECISION) * 100) /
                RATE_PRECISION,
        }))
    : [];
  const borrowUtilization = market
    ? (market.getPrimeCashUtilization() * 100) / RATE_PRECISION
    : 0;

  const chartHeaderData: ChartHeaderDataProps = {
    textHeader:
      actionType === 'borrow' ? (
        <FormattedMessage
          defaultMessage={'{symbol} Borrow Rate | Utilization'}
          values={{ symbol: deposit?.symbol }}
        />
      ) : (
        <FormattedMessage
          defaultMessage={'{symbol} Lending Rate | Utilization'}
          values={{ symbol: deposit?.symbol }}
        />
      ),
    legendData: [
      {
        label: <FormattedMessage defaultMessage={'Current Utilization'} />,
        value: borrowUtilization ? (
          <CountUp value={borrowUtilization} suffix="%" decimals={2} />
        ) : undefined,
        lineColor: theme.palette.background.accentPaper,
        lineType: LEGEND_LINE_TYPES.DASHED,
      },
    ],
  };

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: 'transparent',
      lineType: LEGEND_LINE_TYPES.DASHED,
      formatTitle: (timestamp) => (
        <FormattedMessage
          defaultMessage="{rate} utilization"
          values={{
            rate: <span>{formatNumberAsPercent(timestamp)}</span>,
          }}
        />
      ),
    },
    area: {
      lineColor: colors.blueAccent,
      lineType: LEGEND_LINE_TYPES.SOLID,
      formatTitle: (area) => {
        return actionType === 'borrow' ? (
          <FormattedMessage
            defaultMessage="{rate} Prime Borrow Rate"
            values={{
              rate: <span>{formatNumberAsPercent(area)}</span>,
            }}
          />
        ) : (
          <FormattedMessage
            defaultMessage="{rate} Prime Lending Rate"
            values={{
              rate: <span>{formatNumberAsPercent(area)}</span>,
            }}
          />
        );
      },
    },
  };

  const areaChartStyles: AreaChartStylesProps = {
    line: {
      lineColor: theme.palette.background.accentPaper,
      lineType: LEGEND_LINE_TYPES.DASHED,
    },
    area: {
      lineColor: colors.blueAccent,
      lineType: LEGEND_LINE_TYPES.SOLID,
    },
  };

  return {
    areaChartData,
    areaChartStyles,
    chartToolTipData,
    chartHeaderData,
    borrowUtilization,
  };
};

export default useInterestRateUtilizationChart;
