import { useContext } from 'react';
import { InteractiveAreaChart, AreaChart } from '@notional-finance/mui';
import { useTokenHistory, useNToken } from '@notional-finance/notionable-hooks';
import {
  useMaturitySelect,
  useInteractiveMaturityChart,
} from '@notional-finance/trade';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';

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
  const nToken = useNToken(deposit?.network, deposit?.currencyId);
  const { tvlData } = useTokenHistory(nToken);

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
          areaChartData={tvlData}
          areaLineType="linear"
          yAxisTickFormat="usd"
        />
      ),
    },
  ];
};

export default useLendFixedMultiChart;
