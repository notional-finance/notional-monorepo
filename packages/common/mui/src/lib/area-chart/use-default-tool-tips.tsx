import { getDateString } from '@notional-finance/util';
import { useTheme } from '@mui/material';
import { ChartToolTipDataProps } from '../chart-tool-tip/chart-tool-tip';
import { FormattedMessage } from 'react-intl';
import { LEGEND_LINE_TYPES } from '../chart-header/chart-header';
import { yAxisTickHandler } from './area-chart';

export const useDefaultToolTips = (yAxisTickFormat, title) => {
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
          defaultMessage={'{value} {title}'}
          values={{
            value: <span>{yAxisTickHandler(yAxisTickFormat, area)}</span>,
            title: <span>{title}</span>,
          }}
        />
      ),
    },
  };
  return chartToolTipData;
};

export default useDefaultToolTips;
