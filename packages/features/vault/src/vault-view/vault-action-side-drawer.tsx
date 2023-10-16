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
      routeMatch={`/vaults/${vaultAddress}/:path`}
      defaultHasPosition={'Manage'}
      defaultNoPosition={'CreateVaultPosition'}
      routes={[
        {
          isRootDrawer: true,
          slug: 'CreateVaultPosition',
          Component: CreateVaultPosition,
          requiredState: {
            tradeType: 'CreateVaultPosition',
          },
        },
        {
          isRootDrawer: true,
          slug: 'Manage',
          Component: ManageVault,
          requiredState: {
            tradeType: 'RollVaultPosition',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
          },
        },
        {
          slug: 'DepositVaultCollateral',
          Component: DepositCollateral,
          requiredState: {
            tradeType: 'DepositVaultCollateral',
          },
        },
        {
          slug: 'IncreaseVaultPosition',
          Component: IncreaseVaultPosition,
          requiredState: {
            tradeType: 'IncreaseVaultPosition',
          },
        },
        {
          slug: 'RollVaultPosition',
          Component: RollMaturity,
          requiredState: {
            tradeType: 'RollVaultPosition',
          },
        },
        {
          slug: 'WithdrawAndRepayVault',
          Component: WithdrawAndRepayDebt,
          requiredState: {
            tradeType: 'WithdrawAndRepayVault',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
          },
        },
        {
          slug: 'WithdrawVault',
          Component: WithdrawVault,
          requiredState: {
            tradeType: 'WithdrawVault',
          },
        },
      ]}
    />
  );
};
