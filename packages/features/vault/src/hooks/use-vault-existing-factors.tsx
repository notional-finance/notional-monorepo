import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import {
  useCurrentTradeContext,
  useVaultPosition,
} from '@notional-finance/notionable-hooks';

export function useVaultExistingFactors() {
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, selectedNetwork } = state;
  const trade = useCurrentTradeContext();
  const postVaultFactors = trade?.getPostVaultFactors();
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  const vaultShare = vaultPosition?.vaultShares.token;

  const leverageRatio =
    postVaultFactors?.leverageRatio ||
    vaultPosition?.leverageRatio ||
    undefined;

  return {
    vaultShare,
    priorBorrowRate: vaultPosition?.borrowAPY,
    debt: vaultPosition?.vaultDebt,
    leverageRatio,
  };
}
