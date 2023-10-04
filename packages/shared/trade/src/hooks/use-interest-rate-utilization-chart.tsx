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
import {
  useSelectedNetwork,
  useFCashMarket,
} from '@notional-finance/notionable-hooks';
import { Registry } from '@notional-finance/core-entities';
import { colors } from '@notional-finance/styles';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useInterestRateUtilizationChart = (
  currencyId: number | undefined,
  actionType: string
) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const fCashMarket = useFCashMarket(currencyId);

  let areaChartData: any[] = [];
  let borrowUtilization = 0;
  if (selectedNetwork && currencyId && fCashMarket) {
    borrowUtilization =
      (fCashMarket.getPrimeCashUtilization() * 100) / RATE_PRECISION;

    const formatChartData = () => {
      let count = 0;
      const data: Record<string, number>[] = [];
      while (count < 90) {
        const updatedCount = (count += 10);
        data.push({
          timestamp: updatedCount,
          area:
            actionType === 'borrow'
              ? (fCashMarket.getPrimeDebtRate(
                  (updatedCount / 100) * RATE_PRECISION
                ) *
                  100) /
                RATE_PRECISION
              : (fCashMarket.getPrimeSupplyRate(
                  (updatedCount / 100) * RATE_PRECISION
                ) *
                  100) /
                RATE_PRECISION,
        });
      }
      return data;
    };

    const chartData = formatChartData();

    const { primeCashCurve } = Registry.getConfigurationRegistry().getConfig(
      selectedNetwork,
      currencyId
    );
    if (primeCashCurve) {
      areaChartData = [
        {
          timestamp: 0.0,
          area: 0.0,
        },
        ...chartData,
        {
          timestamp: 100,
          area: (primeCashCurve.maxRate * 100) / RATE_PRECISION,
        },
      ];
    }
  }

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
      formatTitle: (timestamp: any) => (
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
      formatTitle: (area: any) => {
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
