import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ChartToolTipDataProps, Body } from '@notional-finance/mui';
import { RATE_PRECISION } from '@notional-finance/util';
import {
  useSelectedNetwork,
  useFCashMarket,
} from '@notional-finance/notionable-hooks';
import { Registry } from '@notional-finance/core-entities';
import { colors } from '@notional-finance/styles';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useInterestRateUtilizationChart = (
  currencyId: number | undefined
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
          area: (primeCashCurve.kinkRate1 * 100) / RATE_PRECISION,
        },
        {
          timestamp: (primeCashCurve.kinkUtilization2 * 100) / RATE_PRECISION,
          area: (primeCashCurve.kinkRate2 * 100) / RATE_PRECISION,
        },
        {
          timestamp: 100,
          area: (primeCashCurve.maxRate * 100) / RATE_PRECISION,
        },
      ];
    }
  }

  const chartInfoBoxData = [
    {
      TextComponent: (
        <Body sx={{ marginBottom: theme.spacing(2) }}>
          <FormattedMessage
            defaultMessage={
              'The borrow utilization factor is used to calculate the prime borrow premium and is based on the utilization of the variable rate lending market.'
            }
          />
        </Body>
      ),
    },
    {
      TextComponent: (
        <Body>
          <FormattedMessage
            defaultMessage={
              'More borrowers means higher utilization and a higher utilization factor. Fewer borrowers means lower utilization and a lower utilization factor.'
            }
          />
        </Body>
      ),
    },
  ];

  const legendData = {
    textHeader: (
      <FormattedMessage defaultMessage={'Prime Borrow Rate | Utilization'} />
    ),
    legendOne: {
      label: <FormattedMessage defaultMessage={'Prime Borrow Rate'} />,
      // TODO: Add correct value here
      value: '-',
      lineColor: colors.blueAccent,
      lineType: 'solid',
    },
  };

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: theme.palette.background.accentPaper,
      lineType: 'dashed',
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
      lineType: 'solid',
      formatTitle: (area: any) => (
        <FormattedMessage
          defaultMessage="{rate} Prime Borrow Rate"
          values={{
            rate: <span>{formatNumberAsPercent(area)}</span>,
          }}
        />
      ),
    },
  };

  return {
    areaChartData,
    chartToolTipData,
    legendData,
    chartInfoBoxData,
    borrowUtilization,
  };
};

export default useInterestRateUtilizationChart;
