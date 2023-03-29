import { useContext } from 'react';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { VaultParams } from '../vault-view/vault-view';
import { useParams } from 'react-router';
import {
  RollMaturity,
  WithdrawVault,
  WithdrawVaultPostMaturity,
  DepositCollateral,
  CreateVaultPosition,
  WithdrawAndRepayDebt,
  IncreaseVaultPosition,
} from '../side-drawers';
const drawers: Record<VAULT_ACTIONS, React.ComponentType> = {
  [VAULT_ACTIONS.CREATE_VAULT_POSITION]: CreateVaultPosition,
  [VAULT_ACTIONS.INCREASE_POSITION]: IncreaseVaultPosition,
  [VAULT_ACTIONS.DEPOSIT_COLLATERAL]: DepositCollateral,
  [VAULT_ACTIONS.ROLL_POSITION]: RollMaturity,
  [VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT]: WithdrawAndRepayDebt,
  [VAULT_ACTIONS.WITHDRAW_VAULT]: WithdrawVault,
  [VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: WithdrawVaultPostMaturity,
};

export const useVaultSideDrawers = () => {
  // The presence of this sideDrawerKey is used to determine if the openDrawer
  // animation should be triggered or not
  const { sideDrawerKey } = useParams<VaultParams>();
  const {
    state: { vaultAction },
  } = useContext(VaultActionContext);

  const SideDrawerComponent =
    vaultAction && drawers[vaultAction] ? drawers[vaultAction] : null;

  const openDrawer = SideDrawerComponent && sideDrawerKey ? true : false;

  return { SideDrawerComponent, openDrawer };
};

export default useVaultSideDrawers;
