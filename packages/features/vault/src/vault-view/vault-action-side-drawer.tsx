import { useContext } from 'react';
import { useEffect } from 'react';
import { VaultActionContext } from '../vault';
import {
  ManageVault,
  CreateVaultPosition,
  WithdrawVault,
  RollMaturity,
  AdjustLeverage,
} from '../side-drawers';
import { TokenBalance } from '@notional-finance/core-entities';
import { SideDrawerRouter } from '@notional-finance/trade';
import { RiskFactorLimit } from '@notional-finance/risk-engine';
import {
  useVaultPosition,
  useQueryParams,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';

export const VaultActionSideDrawer = () => {
  const context = useContext(VaultActionContext);
  const queryData = useQueryParams();
  const { vaultAddress: vaultAddressParam, action } = useParams<{
    vaultAddress?: string;
    action?: string;
  }>();
  const {
    state: {
      vaultAddress,
      deposit,
      defaultLeverageRatio,
      riskFactorLimit,
      debt,
      collateral,
      selectedNetwork,
      availableCollateralTokens,
      availableDebtTokens,
      tradeType,
    },
    updateState,
  } = context;
  const loaded = vaultAddress && vaultAddressParam === vaultAddress;
  const defaultRiskLimit: RiskFactorLimit<'leverageRatio'> | undefined =
    defaultLeverageRatio && !riskFactorLimit
      ? {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        }
      : undefined;
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const { enabled } = useVaultProperties(selectedNetwork, vaultAddress);

  useEffect(() => {
    const borrowOptionId = queryData.get('borrowOption');
    if (
      borrowOptionId &&
      borrowOptionId !== debt?.id &&
      tradeType === 'CreateVaultPosition'
    ) {
      const newDebt = availableDebtTokens?.find((t) => t.id === borrowOptionId);
      if (newDebt) {
        const collateral = availableCollateralTokens?.find(
          (t) => t.maturity === newDebt?.maturity
        );
        updateState({ debt: newDebt, collateral });
      }
    }
  }, [
    debt,
    availableDebtTokens,
    availableCollateralTokens,
    queryData,
    updateState,
    tradeType,
  ]);

  const currentPosition = {
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
      action={action}
      // If a vault is disabled, then default them to the withdraw vault screen
      defaultHasPosition={enabled ? 'IncreaseVaultPosition' : 'WithdrawVault'}
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
            debt: loaded ? debt : undefined,
            collateral: loaded ? collateral : undefined,
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
            riskFactorLimit: undefined,
            maxWithdraw: false,
          },
        },
        {
          slug: 'AdjustLeverage',
          Component: AdjustLeverage,
          requiredState: {
            tradeType: 'AdjustVaultLeverage',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
            riskFactorLimit: riskFactorLimit || currentPosition.riskFactorLimit,
          },
        },
        {
          slug: 'RollVaultPosition',
          Component: RollMaturity,
          requiredState: {
            tradeType: 'RollVaultPosition',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
            maxWithdraw: false,
          },
        },
        {
          slug: 'WithdrawVault',
          Component: WithdrawVault,
          requiredState: {
            tradeType: 'WithdrawVault',
            riskFactorLimit: currentPosition.riskFactorLimit,
          },
        },
      ]}
    />
  );
};
