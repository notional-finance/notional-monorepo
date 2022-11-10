import {
  GenericBaseVault,
  BaseVault,
  TypedBigNumber,
  VaultAccount,
  VaultConfig,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { formatMaturity, tradeDefaults, VAULT_ACTIONS } from '@notional-finance/utils';

interface UpdatedVaultAccountDependencies {
  // Inputs
  vaultAction?: VAULT_ACTIONS;
  depositAmount?: TypedBigNumber;
  selectedMarketKey: string;
  fCashBorrowAmount?: TypedBigNumber;
  // Via Init
  vaultAccount: VaultAccount;
  baseVault: GenericBaseVault;
}

export function getUpdatedVaultAccount({
  vaultAccount,
  baseVault,
  vaultAction,
  fCashBorrowAmount,
  depositAmount,
  selectedMarketKey,
}: UpdatedVaultAccountDependencies) {
  let updatedVaultAccount: VaultAccount | undefined;
  if (!selectedMarketKey) return { updatedVaultAccount: undefined };

  try {
    const selectedMaturity = Market.parseMaturity(selectedMarketKey);
    if (vaultAction === VAULT_ACTIONS.ROLL_POSITION) {
      // Set this to zero if it is unset, it is optional during these two actions
      const depositInternal =
        depositAmount?.toInternalPrecision() ||
        TypedBigNumber.getZeroUnderlying(baseVault.getVault().primaryBorrowCurrency);

      const { newVaultAccount, fCashToBorrowForRepayment } = baseVault.simulateRollPosition(
        vaultAccount,
        selectedMaturity,
        depositInternal.toInternalPrecision(),
        tradeDefaults.defaultAnnualizedSlippage
      );

      if (fCashBorrowAmount && fCashBorrowAmount.lt(fCashToBorrowForRepayment)) {
        // This is any additional borrow beyond the original
        updatedVaultAccount = baseVault.simulateEnter(
          newVaultAccount,
          selectedMaturity,
          fCashBorrowAmount.sub(fCashToBorrowForRepayment),
          depositInternal.copy(0)
        ).newVaultAccount;
      } else {
        updatedVaultAccount = newVaultAccount;
      }
    } else if (
      vaultAction === VAULT_ACTIONS.ESTABLISH_ACCOUNT &&
      fCashBorrowAmount &&
      depositAmount
    ) {
      updatedVaultAccount = baseVault.simulateEnter(
        vaultAccount,
        selectedMaturity,
        fCashBorrowAmount,
        depositAmount.toInternalPrecision()
      ).newVaultAccount;
    } else if (vaultAction === VAULT_ACTIONS.INCREASE_POSITION && fCashBorrowAmount) {
      updatedVaultAccount = baseVault.simulateEnter(
        vaultAccount,
        selectedMaturity,
        fCashBorrowAmount,
        // Deposit amount is optional when increasing position
        depositAmount?.toInternalPrecision() ||
          TypedBigNumber.getZeroUnderlying(baseVault.getVault().primaryBorrowCurrency)
      ).newVaultAccount;
    }
  } catch {
    // Errors may occur when the maturity is not correct
  }

  return { updatedVaultAccount };
}

interface MinimumLeverageRatioDependencies {
  // Inputs
  vaultAction?: VAULT_ACTIONS;
  depositAmount?: TypedBigNumber;
  selectedMarketKey?: string;
  // Via Init
  vaultConfig: VaultConfig;
  vaultAccount: VaultAccount;
  baseVault: GenericBaseVault;
}

export function getMinimumLeverageRatio({
  vaultAction,
  baseVault,
  selectedMarketKey,
  vaultAccount,
  vaultConfig,
  depositAmount,
}: MinimumLeverageRatioDependencies) {
  const depositInternal =
    depositAmount?.toInternalPrecision() ||
    TypedBigNumber.getZeroUnderlying(baseVault.getVault().primaryBorrowCurrency);
  let minimumLeverageRatio = BaseVault.collateralToLeverageRatio(
    vaultConfig.maxRequiredAccountCollateralRatioBasisPoints
  );
  const selectedMaturity = selectedMarketKey ? Market.parseMaturity(selectedMarketKey) : undefined;

  try {
    if (!selectedMaturity) {
      return { minimumLeverageRatio };
    } else if (vaultAction === VAULT_ACTIONS.INCREASE_POSITION) {
      const { newVaultAccount } = baseVault.simulateEnter(
        vaultAccount,
        selectedMaturity,
        depositInternal.copy(0), // sets borrow amount to zero
        depositInternal,
        false // Don't check min borrow
      );

      const vaultLeverageRatio = baseVault.getLeverageRatio(newVaultAccount);
      minimumLeverageRatio = Math.max(vaultLeverageRatio, minimumLeverageRatio);
    } else if (vaultAction === VAULT_ACTIONS.ROLL_POSITION) {
      const { newVaultAccount } = baseVault.simulateRollPosition(
        vaultAccount,
        selectedMaturity,
        depositInternal,
        0
      );

      const vaultLeverageRatio = baseVault.getLeverageRatio(newVaultAccount);
      minimumLeverageRatio = Math.max(vaultLeverageRatio, minimumLeverageRatio);
    }
  } catch {
    // Errors may occur on account connection when selected maturity
    // is not correct
  }

  return { minimumLeverageRatio };
}

interface VaultAccountDefaultDependencies {
  // Inputs
  vaultAction?: VAULT_ACTIONS;
  // Via Init
  vaultAccount: VaultAccount;
  vaultConfig: VaultConfig;
  baseVault: GenericBaseVault;
  eligibleMarkets: Market[];
  eligibleActions: VAULT_ACTIONS[];
}

export function getVaultAccountDefaults({
  eligibleMarkets,
  eligibleActions,
  vaultAction,
  vaultAccount,
  vaultConfig,
  baseVault,
}: VaultAccountDefaultDependencies) {
  const defaultVaultAction = eligibleActions.length > 0 ? eligibleActions[0] : undefined;

  if (vaultAction === VAULT_ACTIONS.INCREASE_POSITION) {
    const marketKey = eligibleMarkets.length > 0 ? eligibleMarkets[0].marketKey : undefined;
    const leverageRatio = baseVault.getLeverageRatio(vaultAccount);
    const vaultAccountMaturityString =
      vaultAccount && vaultAccount.maturity > 0 ? formatMaturity(vaultAccount?.maturity) : '';

    return { selectedMarketKey: marketKey, leverageRatio, vaultAccountMaturityString, vaultAction };
  } else if (vaultAction === undefined) {
    return {
      vaultAction: defaultVaultAction,
      leverageRatio: BaseVault.collateralToLeverageRatio(
        vaultConfig.maxDeleverageCollateralRatioBasisPoints
      ),
    };
  } else {
    return {};
  }
}
