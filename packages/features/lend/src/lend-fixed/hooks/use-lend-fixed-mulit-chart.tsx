import { useContext } from 'react';
import {
  InteractiveAreaChart,
  SingleDisplayChart,
} from '@notional-finance/mui';
import { useTokenHistory } from '@notional-finance/notionable-hooks';
import {
  useMaturitySelect,
  useInteractiveMaturityChart,
} from '@notional-finance/trade';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';

export const useLendFixedMulitChart = () => {
  const context = useContext(LendFixedContext);
  const {
    state: { deposit },
  } = context;
  const { areaChartData, legendData, chartToolTipData } =
    useInteractiveMaturityChart(deposit?.currencyId);
  const { selectedfCashId, onSelect } = useMaturitySelect(
    'Collateral',
    context
  );

  const { tvlData } = useTokenHistory(deposit);

  console.log({ tvlData });

  return [
    {
      id: 'interactive-chart',
      Component: (
        <InteractiveAreaChart
          interactiveAreaChartData={areaChartData}
          onSelectMarketKey={onSelect}
          selectedMarketKey={selectedfCashId}
          legendData={legendData}
          chartToolTipData={chartToolTipData}
        />
      ),
    },
    {
      id: 'area-chart',
      Component: (
        <SingleDisplayChart
          areaChartData={tvlData}
          chartType="area"
          xAxisTickFormat="date"
          showCartesianGrid
          condenseXAxisTime
          areaLineType="linear"
        />
      ),
    },
  ];
};

export default useLendFixedMulitChart;
