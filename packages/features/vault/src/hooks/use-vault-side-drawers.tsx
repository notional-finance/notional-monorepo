import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useSideDrawerState } from '@notional-finance/side-drawer';
import {
  RollMaturity,
  WithdrawVault,
  DepositCollateral,
  CreateVaultPosition,
  WithdrawAndRepayDebt,
} from '../side-drawers';
import { useLocation } from 'react-router';

export const useVaultSideDrawers = () => {
  const { sideDrawerOpen, currentSideDrawerKey } = useSideDrawerState();
  const { pathname: currentPath } = useLocation();
  const TempComp = () => <div>currentPath: {currentPath}</div>;

  const drawers = {
    [VAULT_ACTIONS.CREATE_VAULT_POSITION]: CreateVaultPosition,
    [VAULT_ACTIONS.INCREASE_POSITION]: TempComp,
    [VAULT_ACTIONS.DEPOSIT_COLLATERAL]: DepositCollateral,
    [VAULT_ACTIONS.ROLL_POSITION]: RollMaturity,
    [VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT]: WithdrawAndRepayDebt,
    [VAULT_ACTIONS.WITHDRAW_VAULT]: WithdrawVault,
    [VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: WithdrawVault,
  };

  const SideDrawerComponent =
    currentSideDrawerKey && drawers[currentSideDrawerKey]
      ? drawers[currentSideDrawerKey]
      : null;

  const openDrawer = SideDrawerComponent && sideDrawerOpen ? true : false;

  return { SideDrawerComponent, openDrawer };
};

export default useVaultSideDrawers;
