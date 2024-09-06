import { MultiDisplayChart, AreaChart } from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { useLiquidationChart } from './use-liquidation-chart';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  TimeSeriesDataPoint,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';

export const LiquidationChart = ({
  state,
  vaultCollateral,
  vaultLiquidationPrice,
}: {
  state: TradeState | VaultTradeState;
  vaultCollateral?: TokenDefinition;
  vaultLiquidationPrice?: TokenBalance | null;
}) => {
  const theme = useTheme();
  const {
    areaChartData,
    areaChartStyles,
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
            hideTopGridLine: true,
            Component: (
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
                areaChartData={areaChartData as TimeSeriesDataPoint[]}
                areaLineType="linear"
                areaChartStyles={areaChartStyles}
              />
            ),
            chartHeaderData: areaChartHeaderData,
          },
        ]}
      />
    </Box>
  );
};
