import { InteractiveAreaChart, AreaChart } from '@notional-finance/mui';
import {
  useChartData,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { useCurrentNetworkStore } from '@notional-finance/notionable-hooks';
import {
  useMaturitySelect,
  useInteractiveMaturityChart,
} from '@notional-finance/trade';
import { ChartType } from '@notional-finance/core-entities';

export const useLendFixedMultiChart = () => {
  const trade = useCurrentTradeContext();
  const { deposit } = trade?.selectedTokens ?? {};
  const { areaChartData, apyToolTipData } =
    useInteractiveMaturityChart(deposit);
  const { selectedfCashId, onSelect } = useMaturitySelect('Collateral');
  const currentNetworkStore = useCurrentNetworkStore();
  const nToken = deposit
    ? currentNetworkStore.getNToken(deposit?.currencyId)
    : undefined;
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
