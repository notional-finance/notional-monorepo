import { useContext } from 'react';
import { InteractiveAreaChart, AreaChart } from '@notional-finance/mui';
import { useChartData } from '@notional-finance/notionable-hooks';
import { useCurrentNetworkStore } from '@notional-finance/notionable';
import {
  useMaturitySelect,
  useInteractiveMaturityChart,
} from '@notional-finance/trade';
import { BorrowFixedContext } from '../../borrow-fixed/borrow-fixed';
import { ChartType } from '@notional-finance/core-entities';

export const useBorrowFixedMultiChart = () => {
  const context = useContext(BorrowFixedContext);
  const {
    state: { deposit },
  } = context;
  const { areaChartData, apyToolTipData } = useInteractiveMaturityChart(
    deposit,
    true
  );
  const currentNetworkStore = useCurrentNetworkStore();
  const nToken = currentNetworkStore.getNToken(deposit?.currencyId);

  const { selectedfCashId, onSelect } = useMaturitySelect('Debt', context);
  const { data: priceData } = useChartData(nToken, ChartType.PRICE);

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
          title="Market Liquidity"
          showCartesianGrid
          xAxisTickFormat="date"
          areaChartData={priceData?.data || []}
          areaDataKey="tvlUSD"
          areaLineType="linear"
          yAxisTickFormat="usd"
        />
      ),
    },
  ];
};

export default useBorrowFixedMultiChart;
