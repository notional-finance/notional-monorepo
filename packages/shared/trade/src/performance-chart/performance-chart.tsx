import {
  MultiDisplayChart,
  AreaChart,
  ChartComponentsProps,
  BarChart,
} from '@notional-finance/mui';
import { usePerformanceChart } from './use-performance-chart';
import { Box, useTheme } from '@mui/material';
import { TokenDefinition } from '@notional-finance/core-entities';
import { FormattedMessage } from 'react-intl';
import useApyChart from './use-apy-chart';
import {
  useAssetPriceHistory,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';

export const PerformanceChart = ({
  currentPositionFactors,
}: {
  currentPositionFactors?: {
    vaultShare?: TokenDefinition;
    isPrimeBorrow: boolean;
    borrowRate?: number;
    leverageRatio?: number;
  };
}) => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const {
    collateral: _collateral,
    deposit,
    debt: _debt,
  } = trade?.selectedTokens || {};
  const collateral = trade?.hasSwappedTokens()
    ? _debt
    : _collateral || currentPositionFactors?.vaultShare;

  const { areaChartData, areaChartStyles, isEmptyState, chartToolTipData } =
    usePerformanceChart(currentPositionFactors);
  const { barConfig, barChartData } = useApyChart(collateral);
  const priceData = useAssetPriceHistory(collateral);

  const chartComponents: ChartComponentsProps[] = [
    {
      id: 'area-chart',
      title: 'Performance',
      hideTopGridLine: true,
      Component: (
        <AreaChart
          showEmptyState={isEmptyState}
          emptyStateMessage={
            <FormattedMessage
              defaultMessage={'Fill in inputs to see leveraged returns'}
            />
          }
          showCartesianGrid
          xAxisTickFormat="date"
          yAxisTickFormat="number"
          yAxisDomain={['dataMin', 'dataMax']}
          xAxisDateTickInterval={Math.floor(areaChartData.length / 5)}
          areaChartData={areaChartData}
          areaLineType="linear"
          chartToolTipData={chartToolTipData}
          areaChartStyles={areaChartStyles}
        />
      ),
      chartHeaderData: {
        messageBox: (
          <FormattedMessage
            defaultMessage={'Value of 100 {symbol} over {days} days'}
            values={{
              symbol: deposit?.symbol,
              days: areaChartData.length,
            }}
          />
        ),
      },
    },
    {
      id: 'bar-chart',
      title:
        collateral?.tokenType === 'VaultShare'
          ? 'Vault APY'
          : `n${deposit?.symbol} APY`,
      hideTopGridLine: true,
      Component: (
        <BarChart
          xAxisTickFormat="date"
          isStackedBar
          barConfig={barConfig}
          barChartData={barChartData || []}
          yAxisTickFormat="percent"
        />
      ),
      chartHeaderData: {
        messageBox:
          collateral?.tokenType === 'VaultShare' ? (
            <FormattedMessage
              defaultMessage={'Incentives are automatically reinvested'}
            />
          ) : undefined,
      },
    },
  ];

  if (collateral?.tokenType === 'VaultShare') {
    chartComponents.push({
      id: 'price-area-chart',
      title: `Vault Share Price`,
      hideTopGridLine: true,
      Component: (
        <AreaChart
          title={`Vault Share Price`}
          showCartesianGrid
          xAxisTickFormat="date"
          yAxisTickFormat="double"
          yAxisDomain={['dataMin * 0.95', 'dataMax * 1.05']}
          areaDataKey={'assetPrice'}
          areaChartData={priceData}
        />
      ),
    });
  }

  return (
    <Box marginBottom={theme.spacing(5)}>
      <MultiDisplayChart chartComponents={chartComponents} />
    </Box>
  );
};
