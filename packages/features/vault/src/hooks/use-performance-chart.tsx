import { useHistoricalReturns } from './use-historical-returns';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { ChartToolTipDataProps } from '@notional-finance/mui';
import { countUpLeverageRatio } from '@notional-finance/trade';
import { useTheme } from '@mui/material';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';

export const usePerformanceChart = () => {
  const theme = useTheme();
  const { historicalReturns, currentBorrowRate } = useHistoricalReturns();
  const { state } = useContext(VaultActionContext);
  const { leverageRatio } = state || {};

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: 'transparent',
      lineType: 'none',
      formatTitle: (timestamp) => (
        <FormattedMessage
          {...messages.summary.date}
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },

    area: {
      lineColor: theme.palette.charts.main,
      lineType: 'solid',
      formatTitle: (area) => (
        <FormattedMessage
          {...messages.summary.performanceLeveragedReturns}
          values={{ returns: <span>{formatNumberAsPercent(area)}</span> }}
        />
      ),
    },

    line: {
      lineColor: theme.palette.charts.accent,
      lineType: 'dashed',
      formatTitle: (line) => (
        <FormattedMessage
          {...messages.summary.unleveragedReturns}
          values={{ returns: <span>{formatNumberAsPercent(line)}</span> }}
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

  const areaChartLegendData = {
    textHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: {
      label: <FormattedMessage {...messages.summary.leveragedReturns} />,
      value:
        currentBorrowRate && leverageRatio
          ? countUpLeverageRatio(leverageRatio)
          : undefined,
      lineColor: theme.palette.charts.main,
      lineType: 'solid',
    },
    legendTwo: {
      label: <FormattedMessage defaultMessage={'Unleveraged Returns'} />,
      value: undefined,
      lineColor: theme.palette.charts.accent,
      lineType: 'dashed',
    },
  };

  return {
    areaChartData,
    areaChartLegendData,
    chartToolTipData,
  };
};
