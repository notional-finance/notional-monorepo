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

const getBaseProtocol = (boosterProtocol: string) => {
  switch (boosterProtocol) {
    case 'Convex':
      return 'Curve';
    case 'Aura':
      return 'Balancer';
    default:
      return 'unknown';
  }
};

export const useVaultStrategyData = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultConfig, selectedDepositToken } = state;
  let name = vaultConfig?.name;
  if (!name) return undefined;
  if (name === 'Curve FRAX/USDC LP (FRAX Leverage)') {
    name = 'SingleSidedLP:Convex:[FRAX]/USDC.e';
  }

  const [_, boosterProtocol, pool] = name.split(':');
  return {
    vaultName: name,
    baseProtocol: getBaseProtocol(boosterProtocol),
    boosterProtocol,
    primaryBorrowCurrency: selectedDepositToken,
    poolName: pool.replace('[', '').replace(']', ''),
    docsLink: `https://docs.notional.finance/leveraged-vaults/leveraged-vaults/${name}`
  };
};
