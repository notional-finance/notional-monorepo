import { useTheme } from '@mui/material';
import { formatNumber } from '@notional-finance/helpers';
import { getDateString } from '@notional-finance/util';
import {
  ChartToolTipDataProps,
  AreaChartStylesProps,
  LEGEND_LINE_TYPES,
} from '@notional-finance/mui';
import {
  calculateDepositValue,
  useCurrentTradeContext,
  useLeveragedPerformance,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export function usePerformanceChart() {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { collateral, debt, deposit } = trade?.selectedTokens || {};
  const { leveragedAPY } = trade?.getVaultAPYBreakdown() ?? {};

  const currentBorrowRate = leveragedAPY?.debtAPY;
  // Always use the specified leverage ratio so that this figure matches
  // the header
  const leverageRatio = leveragedAPY?.leverageRatio || 0;
  const data = useLeveragedPerformance(
    collateral,
    debt,
    currentBorrowRate,
    leverageRatio
  );
  const areaChartData = calculateDepositValue(leverageRatio, data, 30);

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
      formatTitle: (area) => `${formatNumber(area)} ${deposit?.symbol}`,
    },
  };

  const areaChartStyles: AreaChartStylesProps = {
    area: {
      lineColor: theme.palette.charts.main,
      lineType: LEGEND_LINE_TYPES.SOLID,
    },
  };

  return {
    areaChartData,
    areaChartStyles,
    chartToolTipData,
    isEmptyState: currentBorrowRate === undefined,
  };
}
