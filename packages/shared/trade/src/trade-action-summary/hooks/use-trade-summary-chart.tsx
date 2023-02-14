import { FormattedMessage } from 'react-intl';
import { InteractiveAreaChartData } from '@notional-finance/mui';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { Market } from '@notional-finance/sdk/src/system';

export const useTradeSummaryChart = (markets: Market[]) => {
  let marketData: InteractiveAreaChartData[] = [];

  const chartToolTipData = {
    timestamp: {
      title: (timestamp) => getDateString(timestamp),
    },
    area: {
      title: (area) => formatNumberAsPercent(area),
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
    leftHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: undefined,
    legendTwo: undefined,
  };

  return { marketData, areaHeaderData, chartToolTipData };
};
