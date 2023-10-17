import { useContext } from 'react';
import { VaultActionContext } from '../vault';

export interface VaultsDataProps {
  baseProtocol: string;
  boosterProtocol: string;
  primaryBorrowCurrency: string;
  secondaryCurrency: string;
  incentiveToken1: string;
  incentiveToken2: string;
  vaultStrategyId?: string;
}

export const useVaultStrategyData = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultConfig } = state;

  const allVaultData: Record<string, VaultsDataProps> = {
    '0x05f1ce9c': {
      baseProtocol: 'Curve',
      boosterProtocol: 'Convex',
      primaryBorrowCurrency: 'FRAX',
      secondaryCurrency: 'USDC',
      incentiveToken1: 'CRV',
      incentiveToken2: 'CVX',
      vaultStrategyId: '0x05f1ce9c',
    },
    '0x77721081': {
      baseProtocol: 'Balancer',
      boosterProtocol: 'Aura',
      primaryBorrowCurrency: 'ETH',
      secondaryCurrency: 'wstETH',
      incentiveToken1: 'BAL',
      incentiveToken2: 'AURA',
      vaultStrategyId: '0x77721081',
    },
  };

  const vaultStrategyData: VaultsDataProps | undefined =
    vaultConfig?.strategy && allVaultData[vaultConfig?.strategy]
      ? allVaultData[vaultConfig?.strategy]
      : undefined;

  return vaultStrategyData;
};
