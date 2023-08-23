import { SingleDisplayChart } from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { useLiquidationChart } from './use-liquidation-chart';
import { Box, useTheme } from '@mui/material';

export const LiquidationChart = ({
  state,
}: {
  state: TradeState | VaultTradeState;
}) => {
  const theme = useTheme();
  const { areaChartData, areaChartLegendData, chartToolTipData } =
    useLiquidationChart(state);

  return (
    <Box marginBottom={theme.spacing(5)}>
      <SingleDisplayChart
        areaChartData={areaChartData}
        legendData={areaChartLegendData}
        chartToolTipData={chartToolTipData}
        yAxisTickFormat="number"
        yAxisDomain={['auto', 'auto']}
        condenseXAxisTime
        chartType="area"
      />
    </Box>
  );
};
