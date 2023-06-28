import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import {
  RollMaturity,
  WithdrawVault,
  DepositCollateral,
  CreateVaultPosition,
  WithdrawAndRepayDebt,
  IncreaseVaultPosition,
} from '../side-drawers';
import { VaultTradeType } from '@notional-finance/notionable';

const drawers: Record<VaultTradeType, React.ComponentType> = {
  CreateVaultPosition: CreateVaultPosition,
  IncreaseVaultPosition: IncreaseVaultPosition,
  DepositVaultCollateral: DepositCollateral,
  RollVaultPosition: RollMaturity,
  WithdrawAndRepayVault: WithdrawAndRepayDebt,
  WithdrawVault: WithdrawVault,
};

export const useVaultSideDrawers = () => {
  // The presence of tradeType is used to determine if the openDrawer
  // animation should be triggered or not
  const {
    state: { vaultAction, tradeType },
  } = useContext(VaultActionContext);

  const SideDrawerComponent =
    vaultAction && tradeType && drawers[tradeType as VaultTradeType]
      ? drawers[tradeType as VaultTradeType]
      : null;

  const openDrawer = SideDrawerComponent && tradeType ? true : false;

  return { SideDrawerComponent, openDrawer };
};

export default useVaultSideDrawers;
