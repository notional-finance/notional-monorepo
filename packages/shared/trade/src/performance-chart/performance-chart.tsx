import { SingleDisplayChart } from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { usePerformanceChart } from './use-performance-chart';
import { Box, useTheme } from '@mui/material';
import { TokenDefinition } from '@notional-finance/core-entities';

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
  const { areaChartData, areaChartLegendData, chartToolTipData } =
    usePerformanceChart(state, priorVaultFactors);

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
