import { useHistoricalReturns } from './use-historical-returns';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { countUpLeverageRatio } from '@notional-finance/trade';
import {
  ChartToolTipDataProps,
  Label,
  LabelValue,
} from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
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
    legendOne: (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Label>
          <FormattedMessage {...messages.summary.leveragedReturns} />
        </Label>
        <Box
          sx={{
            background: theme.palette.borders.default,
            borderRadius: theme.shape.borderRadius(),
            marginLeft: theme.spacing(1),
            padding: theme.spacing(0.5, 1),
          }}
        >
          {currentBorrowRate && leverageRatio ? (
            <LabelValue>{countUpLeverageRatio(leverageRatio)}</LabelValue>
          ) : (
            <LabelValue sx={{ padding: theme.spacing(0, 2) }}>--</LabelValue>
          )}
        </Box>
      </Box>
    ),
    legendTwo: (
      <Label>
        <FormattedMessage defaultMessage={'Unleveraged Returns'} />
      </Label>
    ),
  };

  return { areaChartData, areaHeaderData, chartToolTipData };
};
