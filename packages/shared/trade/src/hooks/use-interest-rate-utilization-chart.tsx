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
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useInterestRateUtilizationChart = (
  currencyId: number | undefined,
  actionType: string
) => {
  const theme = useTheme();
  const fCashMarket = useFCashMarket(currencyId);

  const areaChartData = fCashMarket
    ? Array(101)
        .fill(0)
        .map((_, i) => ({
          timestamp: i,
          area:
            actionType === 'borrow'
              ? (fCashMarket.getPrimeDebtRate((i / 100) * RATE_PRECISION) *
                  100) /
                RATE_PRECISION
              : (fCashMarket.getPrimeSupplyRate((i / 100) * RATE_PRECISION) *
                  100) /
                RATE_PRECISION,
        }))
    : [];
  const borrowUtilization = fCashMarket
    ? (fCashMarket.getPrimeCashUtilization() * 100) / RATE_PRECISION
    : 0;

  const chartHeaderData: ChartHeaderDataProps = {
    textHeader:
      actionType === 'borrow' ? (
        <FormattedMessage defaultMessage={'Prime Borrow Rate | Utilization'} />
      ) : (
        <FormattedMessage defaultMessage={'Prime Lending Rate | Utilization'} />
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
