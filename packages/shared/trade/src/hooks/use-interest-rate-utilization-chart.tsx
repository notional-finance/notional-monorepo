import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  ChartToolTipDataProps,
  ChartHeaderDataProps,
  AreaChartStylesProps,
  LEGEND_LINE_TYPES,
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
        {
          timestamp: (primeCashCurve.kinkUtilization1 * 100) / RATE_PRECISION,
          area:
            actionType === 'borrow'
              ? (primeCashCurve.kinkRate1 * 100) / RATE_PRECISION
              : (primeCashCurve.kinkRate1 *
                  primeCashCurve.kinkUtilization1 *
                  100) /
                (RATE_PRECISION * RATE_PRECISION),
        },
        {
          timestamp: (primeCashCurve.kinkUtilization2 * 100) / RATE_PRECISION,
          area:
            actionType === 'borrow'
              ? (primeCashCurve.kinkRate2 * 100) / RATE_PRECISION
              : (primeCashCurve.kinkRate2 *
                  primeCashCurve.kinkUtilization2 *
                  100) /
                (RATE_PRECISION * RATE_PRECISION),
        },
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
  };

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: theme.palette.background.accentPaper,
      lineType: LEGEND_LINE_TYPES.DASHED,
      formatTitle: () => (
        <FormattedMessage
          defaultMessage="{rate} utilization"
          values={{
            rate: <span>{formatNumberAsPercent(borrowUtilization)}</span>,
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
