import { PerformanceChart } from '@notional-finance/trade';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { useVaultExistingFactors } from '../hooks';
import { PendlePerformanceChart } from './pendle-performance-chart';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const VaultPerformanceChart = () => {
  const trade = useCurrentTradeContext();
  const { vaultShare, priorBorrowRate, leverageRatio } =
    useVaultExistingFactors();
  const vaultType = trade?.vaultType;

  return vaultType === 'PendlePT' ? (
    <PendlePerformanceChart />
  ) : (
    <PerformanceChart
      currentPositionFactors={{
        vaultShare,
        borrowRate: priorBorrowRate,
        leverageRatio,
        isPrimeBorrow: vaultShare?.maturity === PRIME_CASH_VAULT_MATURITY,
      }}
    />
  );
};
