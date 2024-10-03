import { useContext } from 'react';
import { InteractiveAreaChart, AreaChart } from '@notional-finance/mui';
import { useChartData } from '@notional-finance/notionable-hooks';
import { useCurrentNetworkStore } from '@notional-finance/notionable';
import {
  useMaturitySelect,
  useInteractiveMaturityChart,
} from '@notional-finance/trade';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import { ChartType } from '@notional-finance/core-entities';

export const useLendFixedMultiChart = () => {
  const context = useContext(LendFixedContext);
  const {
    state: { deposit },
  } = context;
  const { areaChartData, apyToolTipData } =
    useInteractiveMaturityChart(deposit);
  const { selectedfCashId, onSelect } = useMaturitySelect(
    'Collateral',
    context
  );
  const currentNetworkStore = useCurrentNetworkStore();
  const nToken = currentNetworkStore.getNToken(deposit?.currencyId);
  const { data: tvlData } = useChartData(nToken, ChartType.PRICE);

  return [
    {
      id: 'interactive-chart',
      title: 'APY By Maturity',
      hideTopGridLine: false,
      Component: (
        <InteractiveAreaChart
          interactiveAreaChartData={areaChartData}
          onSelectMarketKey={onSelect}
          selectedMarketKey={selectedfCashId}
          chartToolTipData={apyToolTipData}
          isMultiChart
        />
      ),
    },
    {
      id: 'area-chart',
      title: 'Market Liquidity',
      hideTopGridLine: true,
      Component: (
        <AreaChart
          showCartesianGrid
          title="Market Liquidity"
          xAxisTickFormat="date"
          areaDataKey="tvlUSD"
          areaChartData={tvlData?.data ?? []}
          areaLineType="linear"
          yAxisTickFormat="usd"
        />
      ),
    },
  ];
};

export default useLendFixedMultiChart;
