import {
  getDateString,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { useTheme } from '@mui/material';
import { ChartToolTipDataProps } from '../chart-tool-tip/chart-tool-tip';
import { FormattedMessage } from 'react-intl';
import { LEGEND_LINE_TYPES } from '../chart-header/chart-header';

export const useDefaultToolTips = () => {
  const theme = useTheme();
  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: 'transparent',
      lineType: LEGEND_LINE_TYPES.NONE,
      formatTitle: (timestamp) => (
        <FormattedMessage
          defaultMessage={'{date}'}
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.charts.main,
      lineType: LEGEND_LINE_TYPES.SOLID,
      formatTitle: (area) => (
        <FormattedMessage
          defaultMessage={'{apy} APY'}
          values={{
            apy: <span>{formatNumberAsPercent(area)}</span>,
          }}
        />
      ),
    },
  };
  return chartToolTipData;
};

export default useDefaultToolTips;
