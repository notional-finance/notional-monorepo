import { useContext } from 'react';
import { VaultActionContext } from '../vault';

export interface VaultsDataProps {
  vaultName: string;
  baseProtocol: string;
  boosterProtocol: string;
  primaryBorrowCurrency: string;
  poolName: string;
  docsLink: string;
}

export const useVaultStrategyData = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultConfig, deposit } = state;
  if (!vaultConfig) return undefined;

  return {
    baseProtocol: vaultConfig.baseProtocol,
    boosterProtocol: vaultConfig.boosterProtocol,
    primaryBorrowCurrency: deposit?.symbol,
    poolName: vaultConfig.poolName,
    docsLink:
      'https://docs.notional.finance/notional-v3/product-guides/leveraged-vaults',
  };
};
