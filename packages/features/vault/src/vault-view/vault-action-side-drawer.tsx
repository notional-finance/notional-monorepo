import {
  ManageVault,
  CreateVaultPosition,
  WithdrawVault,
  RollMaturity,
  AdjustLeverage,
} from '../side-drawers';
import { TokenBalance } from '@notional-finance/core-entities';
import { SideDrawerRouter } from '@notional-finance/trade';
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
  const {
    action,
    vaultAddress: vaultAddressParam,
    selectedNetwork: selectedNetworkParam,
  } = useParams<{
    vaultAddress?: string;
    selectedNetwork?: string;
    action?: string;
  }>();
  const trade = useCurrentTradeContext();
  const { deposit, debt, collateral } = trade?.selectedTokens ?? {};
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

  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const enabled = useVaultProperties(vaultAddress)?.enabled;

  const currentPosition = {
    collateral: vaultPosition?.vaultShares?.token,
    debt: vaultPosition?.vaultDebt?.token,
    leverageRatio: vaultPosition?.leverageRatio,
  };

  return (
    <SideDrawerRouter
      hasPosition={!!vaultPosition}
      // NOTE: need to use the params here to ensure that we can properly navigate
      routeMatch={`/vaults/${selectedNetworkParam}/${vaultAddressParam}/:path`}
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
            leverageRatio: trade?.leverageRatio || defaultLeverageRatio,
            maxWithdraw: false,
            debt: debt || defaultDebtToken,
            collateral: collateral || defaultCollateralToken,
          },
        },
        {
          isRootDrawer: true,
          slug: 'IncreaseVaultPosition',
          Component: CreateVaultPosition,
          requiredState: {
            tradeType: 'IncreaseVaultPosition',
            ...currentPosition,
          },
        },
        {
          slug: 'Manage',
          Component: ManageVault,
          requiredState: {
            tradeType: 'RollVaultPosition',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
            collateral: currentPosition.collateral,
            leverageRatio: currentPosition.leverageRatio,
            maxWithdraw: false,
          },
        },
        {
          slug: 'AdjustLeverage',
          Component: AdjustLeverage,
          requiredState: {
            tradeType: 'AdjustVaultLeverage',
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
            leverageRatio:
              trade?.leverageRatio || currentPosition.leverageRatio,
          },
        },
        {
          slug: 'RollVaultPosition',
          Component: RollMaturity,
          requiredState: {
            tradeType: 'RollVaultPosition',
            collateral: currentPosition.collateral,
            leverageRatio: currentPosition.leverageRatio,
            depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
            maxWithdraw: false,
          },
        },
        {
          slug: 'WithdrawVault',
          Component: WithdrawVault,
          requiredState: {
            tradeType: 'WithdrawVault',
            leverageRatio: currentPosition.leverageRatio,
          },
        },
        {
          slug: 'ClaimVaultRewards',
          Component: ClaimVaultRewards,
          requiredState: {
            // NOTE: this is irrelevant, just needs to be defined to get the trade
            // summary on the left to render
            tradeType: 'IncreaseVaultPosition',
            leverageRatio: defaultLeverageRatio,
          },
        },
      ]}
    />
  );
});
