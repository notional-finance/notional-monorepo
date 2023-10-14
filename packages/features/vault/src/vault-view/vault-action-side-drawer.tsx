import { useContext, useEffect } from 'react';
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
import { SideDrawerRouter } from './side-drawer-route';

export const VaultActionSideDrawer = () => {
  const {
    state: {
      vaultAddress,
      priorAccountRisk,
      tradeType,
      deposit,
      depositBalance,
    },
    updateState,
  } = useContext(VaultActionContext);
  const hasVaultPosition = !!priorAccountRisk;

  useEffect(() => {
    if (
      (tradeType === 'RollVaultPosition' ||
        tradeType === 'WithdrawAndRepayVault') &&
      !depositBalance?.isZero() &&
      deposit
    ) {
      // This update state cannot go inside the the initial state due to
      // race conditions on when deposit is initialized
      updateState({ depositBalance: TokenBalance.zero(deposit) });
    }
  }, [tradeType, deposit, depositBalance, updateState]);

  return (
    <SideDrawerRouter
      currentTradeType={tradeType}
      updateState={updateState}
      hasPosition={hasVaultPosition}
      rootPath={`/vaults/${vaultAddress}`}
      defaultHasPosition={'Manage'}
      defaultNoPosition={'CreateVaultPosition'}
      routes={[
        {
          isRootDrawer: true,
          tradeType: 'CreateVaultPosition',
          Component: CreateVaultPosition,
        },
        {
          isRootDrawer: true,
          tradeType: 'Manage',
          Component: ManageVault,
          initialState: {
            tradeType: 'RollVaultPosition',
            confirm: false,
          },
        },
        {
          tradeType: 'DepositVaultCollateral',
          Component: DepositCollateral,
        },
        {
          tradeType: 'IncreaseVaultPosition',
          Component: IncreaseVaultPosition,
        },
        {
          tradeType: 'RollVaultPosition',
          Component: RollMaturity,
        },
        {
          tradeType: 'WithdrawAndRepayVault',
          Component: WithdrawAndRepayDebt,
        },
        {
          tradeType: 'WithdrawVault',
          Component: WithdrawVault,
        },
      ]}
    />
  );
};
