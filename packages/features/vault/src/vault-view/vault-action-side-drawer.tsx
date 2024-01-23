import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import {
  ManageVault,
  CreateVaultPosition,
  WithdrawVault,
  RollMaturity,
} from '../side-drawers';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
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
      availableDebtTokens,
      availableCollateralTokens,
      selectedDepositToken,
      riskFactorLimit,
      customizeLeverage,
      selectedNetwork,
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
      defaultHasPosition={'IncreaseVaultPosition'}
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
          isRootDrawer: true,
          slug: 'IncreaseVaultPosition',
          Component: CreateVaultPosition,
          requiredState: {
            tradeType: 'IncreaseVaultPosition',
            riskFactorLimit: defaultRiskLimit,
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
          slug: 'RollVaultPosition',
          Component: RollMaturity,
          requiredState: {
            tradeType: 'RollVaultPosition',
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
