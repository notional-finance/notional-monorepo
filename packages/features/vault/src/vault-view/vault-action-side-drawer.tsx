import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import {
  ManageVault,
  CreateVaultPosition,
  DepositCollateral,
  IncreaseVaultPosition,
  WithdrawVault,
  WithdrawAndRepayDebt,
  RollMaturity,
} from '../side-drawers';
import { TokenBalance } from '@notional-finance/core-entities';
import { SideDrawerRouter } from '@notional-finance/trade';

export const VaultActionSideDrawer = () => {
  const context = useContext(VaultActionContext);
  const {
    state: { vaultAddress, priorAccountRisk, deposit },
  } = context;

  return (
    <SideDrawerRouter
      context={context}
      hasPosition={!!priorAccountRisk}
      rootPath={`/vaults/${vaultAddress}`}
      defaultHasPosition={'Manage'}
      defaultNoPosition={'CreateVaultPosition'}
      routes={[
        {
          isRootDrawer: true,
          relPath: 'CreateVaultPosition',
          Component: CreateVaultPosition,
          requiredState: {
            tradeType: 'CreateVaultPosition',
          },
        },
        {
          isRootDrawer: true,
          relPath: 'Manage',
          Component: ManageVault,
          requiredState: {
            tradeType: 'RollVaultPosition',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
          },
        },
        {
          relPath: 'DepositVaultCollateral',
          Component: DepositCollateral,
          requiredState: {
            tradeType: 'DepositVaultCollateral',
          },
        },
        {
          relPath: 'IncreaseVaultPosition',
          Component: IncreaseVaultPosition,
          requiredState: {
            tradeType: 'IncreaseVaultPosition',
          },
        },
        {
          relPath: 'RollVaultPosition',
          Component: RollMaturity,
          requiredState: {
            tradeType: 'RollVaultPosition',
          },
        },
        {
          relPath: 'WithdrawAndRepayVault',
          Component: WithdrawAndRepayDebt,
          requiredState: {
            tradeType: 'WithdrawAndRepayVault',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
          },
        },
        {
          relPath: 'WithdrawVault',
          Component: WithdrawVault,
          requiredState: {
            tradeType: 'WithdrawVault',
          },
        },
      ]}
    />
  );
};
