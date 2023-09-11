import { CreateVaultPosition } from './create-vault-position';
import { DepositCollateral } from './deposit-collateral';
import { IncreaseVaultPosition } from './increase-vault-position';
import { RollMaturity } from './roll-maturity';
import { WithdrawAndRepayDebt } from './withdraw-and-repay-debt';
import { WithdrawVault } from './withdraw-vault';
export { ManageVault } from './manage-vault';

export const VaultDrawers = {
  CreateVaultPosition: CreateVaultPosition,
  IncreaseVaultPosition: IncreaseVaultPosition,
  DepositVaultCollateral: DepositCollateral,
  RollVaultPosition: RollMaturity,
  WithdrawAndRepayVault: WithdrawAndRepayDebt,
  WithdrawVault: WithdrawVault,
};
