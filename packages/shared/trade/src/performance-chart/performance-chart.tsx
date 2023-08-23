import { SingleDisplayChart } from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { usePerformanceChart } from './use-performance-chart';
import { Box, useTheme } from '@mui/material';

export const PerformanceChart = ({
  state,
}: {
  state: TradeState | VaultTradeState;
}) => {
  const theme = useTheme();
  const { areaChartData, areaChartLegendData, chartToolTipData } =
    usePerformanceChart(state);

  return (
    <Box marginBottom={theme.spacing(5)}>
      <SingleDisplayChart
        areaChartData={areaChartData}
        legendData={areaChartLegendData}
        chartToolTipData={chartToolTipData}
        condenseXAxisTime
        chartType="area"
      />
    </Box>
  );
};
