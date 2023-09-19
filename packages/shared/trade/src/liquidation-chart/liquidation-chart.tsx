import {
  MultiDisplayChart,
  AreaChart,
  ChartContainer,
} from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { useLiquidationChart } from './use-liquidation-chart';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';

export const LiquidationChart = ({
  state,
  vaultCollateral,
  vaultLiquidationPrice,
}: {
  state: TradeState | VaultTradeState;
  vaultCollateral?: TokenDefinition;
  vaultLiquidationPrice?: TokenBalance;
}) => {
  const theme = useTheme();
  const {
    areaChartData,
    areaChartHeaderData,
    chartToolTipData,
    yAxisDomain,
    showEmptyState,
  } = useLiquidationChart(state, vaultCollateral, vaultLiquidationPrice);

  return (
    <Box marginBottom={theme.spacing(5)}>
      <MultiDisplayChart
        chartComponents={[
          {
            id: 'area-chart',
            title: 'Liquidation Chart',
            Component: (
              <ChartContainer>
                <AreaChart
                  showEmptyState={showEmptyState}
                  emptyStateMessage={
                    <FormattedMessage
                      defaultMessage={'Fill in inputs to see your price risk'}
                    />
                  }
                  showCartesianGrid
                  yAxisTickFormat="number"
                  yAxisDomain={yAxisDomain}
                  chartToolTipData={chartToolTipData}
                  areaChartData={areaChartData}
                  areaLineType="linear"
                />
              </ChartContainer>
            ),
            chartHeaderData: areaChartHeaderData,
          },
        ]}
      />
    </Box>
  );
};
