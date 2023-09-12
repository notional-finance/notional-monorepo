import { VaultTradeType } from '@notional-finance/notionable';
import { CreateVaultPosition } from './create-vault-position';
import { DepositCollateral } from './deposit-collateral';
import { IncreaseVaultPosition } from './increase-vault-position';
import { RollMaturity } from './roll-maturity';
import { WithdrawAndRepayDebt } from './withdraw-and-repay-debt';
import { WithdrawVault } from './withdraw-vault';
import { ComponentType } from 'react';
export { ManageVault } from './manage-vault';

export const VaultDrawers: Record<VaultTradeType, ComponentType> = {
  CreateVaultPosition: CreateVaultPosition,
  IncreaseVaultPosition: IncreaseVaultPosition,
  DepositVaultCollateral: DepositCollateral,
  RollVaultPosition: RollMaturity,
  WithdrawAndRepayVault: WithdrawAndRepayDebt,
  WithdrawVault: WithdrawVault,
};
