import { FormattedMessage } from 'react-intl';
import {
  InteractiveAreaChartData,
  ChartToolTipDataProps,
} from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { Market } from '@notional-finance/sdk/src/system';

export const useTradeSummaryChart = (markets: Market[]) => {
  const theme = useTheme();
  let marketData: InteractiveAreaChartData[] = [];

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      formatTitle: (timestamp) => (
        <FormattedMessage
          defaultMessage="{date}"
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.charts.accent,
      lineType: 'none',
      formatTitle: (area) => (
        <span>
          <FormattedMessage
            defaultMessage="Fixed Rate: {rate}"
            values={{ rate: formatNumberAsPercent(area) }}
          />
        </span>
      ),
    },
  };

  if (markets && markets.length) {
    marketData = markets.map((market) => {
      return {
        timestamp: market.maturity,
        area: parseFloat(
          market.midRate.substring(0, market.midRate.length - 1)
        ),
        marketKey: market.marketKey,
      };
    });
  }

  const areaHeaderData = {
    textHeader: <FormattedMessage defaultMessage={'Yield Curve'} />,
    legendOne: undefined,
    legendTwo: undefined,
  };

  return { marketData, areaHeaderData, chartToolTipData };
};
