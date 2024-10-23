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
import { useAssetPriceHistory } from '@notional-finance/notionable-hooks';

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
  const { areaChartData, areaChartStyles, isEmptyState, chartToolTipData } =
    usePerformanceChart(state, priorVaultFactors);
  const { collateral: _collateral, deposit, selectedDepositToken } = state;
  const collateral = _collateral || priorVaultFactors?.vaultShare;
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
          : `n${selectedDepositToken} APY`,
      hideTopGridLine: true,
      Component: (
        <BarChart
          xAxisTickFormat="date"
          isStackedBar
          barConfig={barConfig}
          barChartData={barChartData?.data || []}
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
