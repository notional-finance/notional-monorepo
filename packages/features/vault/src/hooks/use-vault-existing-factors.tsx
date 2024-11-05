import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import { useVaultPosition } from '@notional-finance/notionable-hooks';

export function useVaultExistingFactors() {
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, selectedNetwork, postAccountRisk } = state;
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  const vaultShare = vaultPosition?.vault.vaultShares.token;

  const leverageRatio =
    postAccountRisk?.leverageRatio || vaultPosition?.leverageRatio || undefined;

  return {
    vaultShare,
    priorBorrowRate: vaultPosition?.borrowAPY,
    debt: vaultPosition?.vault.vaultDebt,
    leverageRatio,
  };
}
