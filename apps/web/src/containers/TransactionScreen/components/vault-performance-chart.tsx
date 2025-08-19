import { PerformanceChart } from '@notional-finance/trade';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { useVaultExistingFactors } from '../hooks/use-vault-existing-factors';
import { PendlePerformanceChart } from './pendle-performance-chart';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const VaultPerformanceChart = () => {
  const trade = useCurrentTradeContext();
  const { vaultShare, priorBorrowRate, leverageRatio } =
    useVaultExistingFactors();

  return trade?.strategyType === 'PendlePT' ? (
    <PendlePerformanceChart />
  ) : (
    <PerformanceChart
      currentPositionFactors={{
        collateralToken: vaultShare,
        borrowRate: priorBorrowRate,
        leverageRatio,
        isPrimeBorrow: vaultShare?.maturity === PRIME_CASH_VAULT_MATURITY,
      }}
    />
  );
};
