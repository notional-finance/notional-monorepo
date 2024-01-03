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
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { TokenBalance } from '@notional-finance/core-entities';
import { SideDrawerRouter } from '@notional-finance/trade';
import { RiskFactorLimit } from '@notional-finance/risk-engine';

export const VaultActionSideDrawer = () => {
  const context = useContext(VaultActionContext);
  const {
    state: {
      vaultAddress,
      priorAccountRisk,
      deposit,
      defaultLeverageRatio,
      availableDebtTokens,
      availableCollateralTokens,
      selectedDepositToken,
      riskFactorLimit,
      customizeLeverage,
    },
  } = context;
  const loaded = deposit && deposit?.symbol === selectedDepositToken;
  const defaultRiskLimit: RiskFactorLimit<'leverageRatio'> | undefined =
    defaultLeverageRatio && !riskFactorLimit
      ? {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        }
      : undefined;
  const currentPositionState = {
    collateral: priorAccountRisk?.assets.token,
    debt: priorAccountRisk?.debts.token,
    riskFactorLimit: priorAccountRisk?.leverageRatio
      ? ({
          riskFactor: 'leverageRatio',
          limit: priorAccountRisk?.leverageRatio,
        } as RiskFactorLimit<'leverageRatio'>)
      : undefined,
  };

  return (
    <SideDrawerRouter
      context={context}
      hasPosition={!!priorAccountRisk}
      routeMatch={`/vaults/${vaultAddress}/:path`}
      defaultHasPosition={'CreateVaultPosition'}
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
            // TODO set debt and collateral here
            debt:
              loaded && !customizeLeverage
                ? availableDebtTokens?.find(
                    (t) => t.maturity === PRIME_CASH_VAULT_MATURITY
                  )
                : undefined,
            collateral:
              loaded && !customizeLeverage
                ? availableCollateralTokens?.find(
                    (t) => t.maturity === PRIME_CASH_VAULT_MATURITY
                  )
                : undefined,
          },
        },
        {
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
