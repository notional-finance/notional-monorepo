import {
  MultiDisplayChart,
  AreaChart,
  ChartComponentsProps,
  BarChart,
} from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { usePerformanceChart } from './use-performance-chart';
import { Box, useTheme } from '@mui/material';
import { TokenDefinition } from '@notional-finance/core-entities';
import { FormattedMessage } from 'react-intl';
import useApyChart from './use-apy-chart';

export const PerformanceChart = ({
  state,
  priorVaultFactors,
}: {
  state: TradeState | VaultTradeState;
  priorVaultFactors?: {
    vaultShare?: TokenDefinition;
    isPrimeBorrow: boolean;
    vaultBorrowRate?: number;
    leverageRatio?: number;
  };
}) => {
  const theme = useTheme();
  const {
    areaChartData,
    areaChartStyles,
    areaChartHeaderData,
    currentDepositValue,
    chartToolTipData,
  } = usePerformanceChart(state, priorVaultFactors);
  const { collateral } = state;
  const { barConfig, barChartData } = useApyChart(collateral);

  const chartComponents: ChartComponentsProps[] = [
    {
      id: 'area-chart',
      title: 'Deposit Value',
      hideTopGridLine: true,
      Component: (
        <AreaChart
          showEmptyState={currentDepositValue === undefined ? true : false}
          emptyStateMessage={
            <FormattedMessage
              defaultMessage={'Fill in inputs to see leveraged returns'}
            />
          }
          showCartesianGrid
          xAxisTickFormat="date"
          yAxisTickFormat="number"
          yAxisDomain={['dataMin', 'dataMax']}
          areaChartData={areaChartData}
          areaLineType="linear"
          chartToolTipData={chartToolTipData}
          areaChartStyles={areaChartStyles}
        />
      ),
      chartHeaderData: areaChartHeaderData,
    },
    {
      id: 'bar-chart',
      title: 'APY',
      hideTopGridLine: true,
      Component: (
        <BarChart
          title="APY"
          xAxisTickFormat="date"
          isStackedBar
          barConfig={barConfig}
          barChartData={barChartData}
          yAxisTickFormat="percent"
        />
      ),
    },
  ];

  return (
    <Box marginBottom={theme.spacing(5)}>
      <MultiDisplayChart chartComponents={chartComponents} />
    </Box>
  );
};
