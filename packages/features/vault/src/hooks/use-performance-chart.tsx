import { useHistoricalReturns } from './use-historical-returns';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { countUpLeverageRatio } from '@notional-finance/trade';
import { ChartToolTipDataProps } from '@notional-finance/mui';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';

export const usePerformanceChart = () => {
  const { historicalReturns, currentBorrowRate } = useHistoricalReturns();
  const { state } = useContext(VaultActionContext);
  const { leverageRatio } = state || {};

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      title: (timestamp) => (
        <FormattedMessage
          {...messages.summary.date}
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },

    area: {
      title: (area) => (
        <FormattedMessage
          {...messages.summary.performanceLeveragedReturns}
          values={{ returns: formatNumberAsPercent(area) }}
        />
      ),
    },

    line: {
      title: (line) => (
        <FormattedMessage
          {...messages.summary.performanceStrategyReturns}
          values={{ returns: formatNumberAsPercent(line) }}
        />
      ),
    },
  };

  const areaChartData = historicalReturns.map((item) => {
    return {
      timestamp: item?.timestamp,
      line: item?.totalRate,
      area: item?.leveragedReturn,
    };
  });

  const areaHeaderData = {
    leftHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: currentBorrowRate ? (
      <FormattedMessage
        {...messages.summary.leveragedReturns}
        values={{
          leverageRatio: leverageRatio
            ? countUpLeverageRatio(leverageRatio)
            : '',
        }}
      />
    ) : undefined,
    legendTwo: <FormattedMessage defaultMessage={'Unleveraged Returns'} />,
  };

  return { areaChartData, areaHeaderData, chartToolTipData };
};
