import { SingleDisplayChart } from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useLiquidationChart } from './use-liquidation-chart';
import { Box, useTheme } from '@mui/material';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';

export const LiquidationChart = ({
  state,
  vaultCollateral,
  vaultLiquidationPrice
}: {
  state: BaseTradeState;
  vaultCollateral?: TokenDefinition;
  vaultLiquidationPrice?: TokenBalance;
}) => {
  const theme = useTheme();
  const { areaChartData, areaChartLegendData, chartToolTipData, yAxisDomain } =
    useLiquidationChart(state, vaultCollateral, vaultLiquidationPrice);

  return (
    <Box marginBottom={theme.spacing(5)}>
      <SingleDisplayChart
        areaChartData={areaChartData}
        legendData={areaChartLegendData}
        chartToolTipData={chartToolTipData}
        yAxisTickFormat="number"
        yAxisDomain={yAxisDomain}
        condenseXAxisTime
        chartType="area"
      />
    </Box>
  );
};
