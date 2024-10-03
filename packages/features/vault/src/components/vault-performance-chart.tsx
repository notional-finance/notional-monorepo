import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import { PerformanceChart } from '@notional-finance/trade';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { useVaultExistingFactors } from '../hooks';
import { getVaultType } from '@notional-finance/core-entities';
import { PendlePerformanceChart } from './pendle-performance-chart';

export const VaultPerformanceChart = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultShare, priorBorrowRate, leverageRatio } =
    useVaultExistingFactors();
  const { selectedNetwork, vaultAddress } = state;
  const vaultType =
    vaultAddress && selectedNetwork
      ? getVaultType(vaultAddress, selectedNetwork)
      : undefined;

  return vaultType === 'PendlePT' ? (
    <PendlePerformanceChart />
  ) : (
    <PerformanceChart
      state={state}
      priorVaultFactors={{
        vaultShare,
        vaultBorrowRate: priorBorrowRate,
        leverageRatio,
        isPrimeBorrow: vaultShare?.maturity === PRIME_CASH_VAULT_MATURITY,
      }}
    />
  );
};
