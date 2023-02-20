import {
  VaultConfig,
  VaultAccount,
  GenericBaseVault,
  BaseVault,
} from '@notional-finance/sdk';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';

interface LeverageRatioDependencies {
  // Inputs
  vaultAction: VAULT_ACTIONS;
  // Via Init
  vaultConfig: VaultConfig;
  vaultAccount: VaultAccount;
  baseVault: GenericBaseVault;
}

export function getDefaultLeverageRatio({
  vaultAction,
  baseVault,
  vaultAccount,
  vaultConfig,
}: LeverageRatioDependencies) {
  const defaultLeverageRatio = BaseVault.collateralToLeverageRatio(
    vaultConfig.maxDeleverageCollateralRatioBasisPoints
  );

  if (
    vaultAction === VAULT_ACTIONS.INCREASE_POSITION ||
    vaultAction === VAULT_ACTIONS.ROLL_POSITION
  ) {
    // Defaults when increasing or rolling position is the vault's current leverage ratio
    return { leverageRatio: baseVault.getLeverageRatio(vaultAccount) };
  } else if (vaultAction === VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT) {
    // During withdraw and repay debt, set to the minimum between the current or the
    // default (which is considered to be a safe ratio)
    return {
      leverageRatio: Math.min(
        baseVault.getLeverageRatio(vaultAccount),
        defaultLeverageRatio
      ),
    };
  } else if (vaultAction === VAULT_ACTIONS.CREATE_VAULT_POSITION) {
    // For vault creation, set to the default position
    return { leverageRatio: defaultLeverageRatio };
  }

  // For any other actions, do not reset the leverage ratio
  return {};
}
