import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import { getVaultDocsLink } from '@notional-finance/core-entities';

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
  const { vaultConfig, deposit, selectedNetwork, vaultAddress } = state;
  const docsLink = getVaultDocsLink(vaultAddress, selectedNetwork);

  if (!vaultConfig) return undefined;

  return {
    baseProtocol: vaultConfig.baseProtocol,
    boosterProtocol: vaultConfig.boosterProtocol,
    primaryBorrowCurrency: deposit?.symbol,
    poolName: vaultConfig.poolName,
    docsLink,
  };
};
