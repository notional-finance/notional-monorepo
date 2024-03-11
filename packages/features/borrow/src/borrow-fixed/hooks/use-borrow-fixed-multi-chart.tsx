import { useContext } from 'react';
import { InteractiveAreaChart, AreaChart } from '@notional-finance/mui';
import { useTokenHistory, useNToken } from '@notional-finance/notionable-hooks';
import {
  useMaturitySelect,
  useInteractiveMaturityChart,
} from '@notional-finance/trade';
import { BorrowFixedContext } from '../../borrow-fixed/borrow-fixed';

export const useBorrowFixedMultiChart = () => {
  const context = useContext(BorrowFixedContext);
  const {
    state: { deposit },
  } = context;
  const { areaChartData, apyToolTipData } = useInteractiveMaturityChart(
    deposit,
    true
  );
  const { selectedfCashId, onSelect } = useMaturitySelect('Debt', context);
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
          title="Market Liquidity"
          showCartesianGrid
          xAxisTickFormat="date"
          areaChartData={tvlData}
          areaLineType="linear"
          yAxisTickFormat="usd"
        />
      ),
    },
  ];
};

export default useBorrowFixedMultiChart;
