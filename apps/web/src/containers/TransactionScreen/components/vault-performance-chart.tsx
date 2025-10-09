import { PerformanceChart } from '@notional-finance/trade';
import { PendlePerformanceChart } from './pendle-performance-chart';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const VaultPerformanceChart = () => {
  const trade = useCurrentTradeContext();

  return trade?.strategyType === 'PendlePT' ? (
    <PendlePerformanceChart />
  ) : (
    <PerformanceChart />
  );
};
