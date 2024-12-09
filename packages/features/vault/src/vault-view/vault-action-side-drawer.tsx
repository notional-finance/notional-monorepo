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
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';
import { ClaimVaultRewards } from '../side-drawers/claim-vault-rewards';
import { observer } from 'mobx-react-lite';

export const VaultActionSideDrawer = observer(() => {
  const queryData = useQueryParams();
  const { action } = useParams<{
    vaultAddress?: string;
    action?: string;
  }>();
  const trade = useCurrentTradeContext();
  const { deposit } = trade?.selectedTokens ?? {};
  const defaultLeverageRatio = trade?.defaultLeverageRatio;
  const { debt: availableDebtTokens, collateral: availableCollateralTokens } =
    trade?.availableTokens ?? {};
  const selectedNetwork = trade?.selectedNetwork;
  const tradeType = trade?.tradeType;
  const vaultAddress = trade?.vaultAddress;

  const defaultDebtToken =
    tradeType === 'CreateVaultPosition'
      ? availableDebtTokens?.find((t) => t.id === queryData.get('borrowOption'))
      : undefined;
  const defaultCollateralToken = availableCollateralTokens?.find(
    (t) => t.maturity === defaultDebtToken?.maturity
  );

  const riskFactorLimit = trade?.leverageRatio
    ? ({
        riskFactor: 'leverageRatio',
        limit: trade?.leverageRatio,
        args: [],
      } as RiskFactorLimit<'leverageRatio'>)
    : undefined;

  const defaultRiskLimit: RiskFactorLimit<'leverageRatio'> | undefined =
    defaultLeverageRatio && !riskFactorLimit
      ? {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        }
      : undefined;
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const enabled = useVaultProperties(vaultAddress)?.enabled;

  const currentPosition = {
    collateral: vaultPosition?.vaultShares?.token,
    debt: vaultPosition?.vaultDebt?.token,
    riskFactorLimit: vaultPosition?.leverageRatio
      ? ({
          riskFactor: 'leverageRatio',
          limit: vaultPosition?.leverageRatio,
        } as RiskFactorLimit<'leverageRatio'>)
      : undefined,
  };

  return (
    <SideDrawerRouter
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
            debt: defaultDebtToken,
            collateral: defaultCollateralToken,
          },
        },
        {
          isRootDrawer: true,
          slug: 'IncreaseVaultPosition',
          Component: CreateVaultPosition,
          requiredState: {
            tradeType: 'IncreaseVaultPosition',
            riskFactorLimit:
              currentPosition.riskFactorLimit || defaultRiskLimit,
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
        {
          slug: 'ClaimVaultRewards',
          Component: ClaimVaultRewards,
          requiredState: {
            // NOTE: this is irrelevant, just needs to be defined to get the trade
            // summary on the left to render
            tradeType: 'IncreaseVaultPosition',
            riskFactorLimit: defaultRiskLimit,
          },
        },
      ]}
    />
  );
});
