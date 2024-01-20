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
import { RiskFactorLimit } from '@notional-finance/risk-engine';
import { useVaultPosition } from '@notional-finance/notionable-hooks';

export const VaultActionSideDrawer = () => {
  const context = useContext(VaultActionContext);
  const {
    state: {
      vaultAddress,
      deposit,
      defaultLeverageRatio,
      riskFactorLimit,
      selectedNetwork,
    },
  } = context;
  const defaultRiskLimit: RiskFactorLimit<'leverageRatio'> | undefined =
    defaultLeverageRatio && !riskFactorLimit
      ? {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        }
      : undefined;
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  const currentPositionState = {
    collateral: vaultPosition?.vault?.vaultShares?.token,
    debt: vaultPosition?.vault?.vaultDebt.token,
    riskFactorLimit: vaultPosition?.leverageRatio
      ? ({
          riskFactor: 'leverageRatio',
          limit: vaultPosition?.leverageRatio,
        } as RiskFactorLimit<'leverageRatio'>)
      : undefined,
  };

  return (
    <SideDrawerRouter
      context={context}
      hasPosition={!!vaultPosition}
      routeMatch={`/vaults/${selectedNetwork}/${vaultAddress}/:path`}
      defaultHasPosition={'Manage'}
      defaultNoPosition={'CreateVaultPosition'}
      routes={[
        {
          isRootDrawer: true,
          slug: 'CreateVaultPosition',
          Component: CreateVaultPosition,
          requiredState: {
            tradeType: 'CreateVaultPosition',
            riskFactorLimit: defaultRiskLimit,
            maxWithdraw: false,
          },
        },
        {
          isRootDrawer: true,
          slug: 'Manage',
          Component: ManageVault,
          requiredState: {
            tradeType: 'RollVaultPosition',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
            maxWithdraw: false,
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
            riskFactorLimit: defaultRiskLimit,
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
            riskFactorLimit: defaultRiskLimit,
          },
        },
        {
          slug: 'WithdrawVault',
          Component: WithdrawVault,
          requiredState: {
            tradeType: 'WithdrawVault',
            riskFactorLimit: currentPositionState.riskFactorLimit,
          },
        },
      ]}
    />
  );
};
