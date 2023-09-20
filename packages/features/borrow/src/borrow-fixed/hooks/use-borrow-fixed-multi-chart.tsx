import { useContext } from 'react';
import {
  InteractiveAreaChart,
  AreaChart,
  ChartContainer,
} from '@notional-finance/mui';
import {
  useTokenHistory,
  useCurrency,
} from '@notional-finance/notionable-hooks';
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
  const { areaChartData, apyToolTipData, tvlToolTipData } =
    useInteractiveMaturityChart(deposit?.currencyId);
  const { selectedfCashId, onSelect } = useMaturitySelect(
    'Collateral',
    context
  );
  const { nTokens } = useCurrency();
  const nTokenData = nTokens.find(
    ({ currencyId }) => currencyId === deposit?.currencyId
  );
  const { tvlData } = useTokenHistory(nTokenData);

  return [
    {
      id: 'interactive-chart',
      title: 'APY By Maturity',
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
      title: 'TVL',
      Component: (
        <ChartContainer>
          <AreaChart
            showCartesianGrid
            xAxisTickFormat="date"
            areaChartData={tvlData}
            chartToolTipData={tvlToolTipData}
            areaLineType="linear"
            yAxisTickFormat="usd"
          />
        </ChartContainer>
      ),
    },
  ];
};

export default useBorrowFixedMultiChart;
