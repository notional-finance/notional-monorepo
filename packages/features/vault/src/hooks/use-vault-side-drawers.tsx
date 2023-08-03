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

export const useVaultSideDrawers = (tradeType?: VaultTradeType) => {
  const SideDrawerComponent = tradeType
    ? drawers[tradeType as VaultTradeType]
    : null;

  const openDrawer = SideDrawerComponent && tradeType ? true : false;

  return { SideDrawerComponent, openDrawer };
};

export default useVaultSideDrawers;
