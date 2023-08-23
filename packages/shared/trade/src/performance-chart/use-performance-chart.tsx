import { useTheme } from '@mui/material';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { ChartToolTipDataProps, CountUp } from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { useLeveragedPerformance } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export function usePerformanceChart(state: TradeState | VaultTradeState) {
  const theme = useTheme();
  const { collateral, debt, debtOptions, postAccountRisk, riskFactorLimit } =
    state;
  const currentBorrowRate = debtOptions?.find(
    (t) => t.token.id === debt?.id
  )?.interestRate;

  const leverageRatio = postAccountRisk
    ? postAccountRisk.leverageRatio
    : (riskFactorLimit?.limit as number | undefined);
  const data = useLeveragedPerformance(
    collateral,
    debt?.tokenType === 'PrimeDebt',
    currentBorrowRate,
    leverageRatio
  );

  const areaChartData = data.map((d) => ({
    timestamp: d.timestamp,
    line: d.leveragedReturn,
    area: d.strategyReturn,
  }));

  const { leveragedReturn, strategyReturn } =
    data.length > 0
      ? data[data.length - 1]
      : { leveragedReturn: undefined, strategyReturn: undefined };

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: 'transparent',
      lineType: 'none',
      formatTitle: (timestamp) => (
        <FormattedMessage
          defaultMessage={'{date}'}
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.charts.main,
      lineType: 'solid',
      formatTitle: (area) => (
        <FormattedMessage
          defaultMessage={'{returns} Unleveraged Returns'}
          values={{ returns: <span>{formatNumberAsPercent(area)}</span> }}
        />
      ),
    },
    line: {
      lineColor: theme.palette.charts.accent,
      lineType: 'dashed',
      formatTitle: (line) => (
        <FormattedMessage
          defaultMessage={'{returns} Leveraged Returns'}
          values={{ returns: <span>{formatNumberAsPercent(line)}</span> }}
        />
      ),
    },
  };

  const areaChartLegendData = {
    textHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: {
      label: <FormattedMessage defaultMessage={'Unleveraged Returns'} />,
      value: strategyReturn ? (
        <CountUp value={strategyReturn} suffix="%" decimals={3} />
      ) : undefined,
      lineColor: theme.palette.charts.main,
      lineType: 'solid',
    },
    legendTwo: {
      label: <FormattedMessage defaultMessage={'Leveraged Returns'} />,
      value: leveragedReturn ? (
        <CountUp value={leveragedReturn} suffix="%" decimals={3} />
      ) : undefined,
      lineColor: theme.palette.charts.accent,
      lineType: 'dashed',
    },
  };

  return {
    areaChartData,
    areaChartLegendData,
    chartToolTipData,
  };
}
