import { reportNotionalError } from '../../error/error-manager';
import {
  VaultConfig,
  VaultAccount,
  Account,
  VaultFactory,
  BaseVault,
} from '@notional-finance/sdk';
import { Market, System } from '@notional-finance/sdk/src/system';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { getNowSeconds } from '@notional-finance/helpers';
import { NoEligibleMarketsReason, VaultError } from '../vault-action-store';
import { getFullWithdrawAmounts } from './get-withdraw-amount-data';

interface InitVaultActionDependencies {
  system: System;
  activeVaultMarkets: Map<string, string[]>;
  vaultAddress: string;
  account: Account | null;
}

export function getInitVaultAction({
  system,
  account,
  vaultAddress,
  activeVaultMarkets,
}: InitVaultActionDependencies) {
  let vaultConfig: VaultConfig | undefined;

  try {
    // This can throw an error on a vault address that is not found
    vaultConfig = system.getVault(vaultAddress);
  } catch (e) {
    // May throw an error on undefined vault address, in this case
    // we return default values for the rest of the parameters but report
    // an error which takes us to the 404 page
    reportNotionalError(
      { ...(e as Error), code: 404 },
      'vault-action',
      'getInitVaultAction'
    );

    // All other values are undefined
    return {
      eligibleActions: [],
      eligibleMarkets: [],
      error: VaultError.VaultConfigNotFound,
    };
  }

  const vaultAccount =
    account?.accountData?.getVaultAccount(vaultAddress) ||
    VaultAccount.emptyVaultAccount(vaultAddress);

  const settledVaultValues = vaultAccount.canSettle()
    ? vaultAccount.getSettlementValues()
    : undefined;

  const baseVault = VaultFactory.buildVaultFromCache(
    vaultConfig.strategy,
    vaultAddress
  );
  const { eligibleMarkets, noEligibleMarketsReason } = getEligibleMarkets(
    system,
    vaultConfig,
    vaultAccount,
    activeVaultMarkets,
    vaultAddress
  );
  const eligibleActions = getEligibleActions(eligibleMarkets, vaultAccount);
  const minLeverageRatio = BaseVault.collateralToLeverageRatio(
    vaultConfig.maxRequiredAccountCollateralRatioBasisPoints
  );

  const maxLeverageRatio = BaseVault.collateralToLeverageRatio(
    vaultConfig.minCollateralRatioBasisPoints
  );

  let maxWithdrawAmountString = '';
  try {
    const { amountToWallet } = getFullWithdrawAmounts(baseVault, vaultAccount);
    maxWithdrawAmountString = amountToWallet?.toExactString();
  } catch (e) {
    maxWithdrawAmountString = '';
  }

  // If there is only one eligible vault action, then set it as the default
  const vaultAction =
    eligibleActions.length === 1 ? eligibleActions[0] : undefined;

  return {
    accountAddress: account?.address || undefined,
    vaultAccount,
    vaultConfig,
    baseVault,
    eligibleMarkets,
    eligibleActions,
    settledVaultValues,
    noEligibleMarketsReason,
    minLeverageRatio,
    maxLeverageRatio,
    primaryBorrowCurrency: vaultConfig.primaryBorrowCurrency,
    primaryBorrowSymbol: system.getUnderlyingSymbol(
      vaultConfig.primaryBorrowCurrency
    ),
    minBorrowSize:
      vaultConfig.minAccountBorrowSize.toDisplayStringWithSymbol(0),
    minAccountBorrowSize: vaultConfig.minAccountBorrowSize,
    strategyName: VaultFactory.resolveStrategyName(vaultConfig.strategy) || '',
    maxWithdrawAmountString: maxWithdrawAmountString,
    // Clear inputs back to initial conditions
    vaultAction,
    hasError: false,
    selectedMarketKey: undefined,
    leverageRatio: undefined,
    depositAmount: undefined,
    withdrawAmount: undefined,
    maxWithdraw: undefined,
  };
}

function getEligibleMarkets(
  system: System,
  vaultConfig: VaultConfig,
  vaultAccount: VaultAccount,
  activeVaultMarkets: Map<string, string[]>,
  vaultAddress: string
) {
  // Active market keys excludes any markets that have any cash held and the
  // max borrow market index
  const activeMarketKeys = activeVaultMarkets.get(vaultAddress) || [];
  let eligibleMarkets = system
    .getMarkets(vaultConfig.primaryBorrowCurrency)
    .filter((m) => activeMarketKeys.includes(m.marketKey));

  // @follow-up after Notional V3 upgrade, only check for allow roll position
  // here. The logic will simplify to:
  /**
  if (!vaultConfig.allowRollPosition) {
    // In this case, the vault does not allow roll position and therefore
    // the only eligible market is the one that matches the current maturity
    eligibleMarkets = eligibleMarkets.filter((m) => m.maturity === vaultAccount.maturity)
  }
  */

  // If account has not yet matured, then include longer dated maturities
  if (vaultAccount.maturity > getNowSeconds()) {
    eligibleMarkets = eligibleMarkets.filter((m) =>
      vaultConfig.allowRollPosition
        ? m.maturity >= vaultAccount.maturity
        : m.maturity === vaultAccount.maturity
    );
  }

  // @note For simplicity, do not check for matured but not settled here.
  return {
    eligibleMarkets,
    noEligibleMarketsReason:
      eligibleMarkets.length === 0
        ? NoEligibleMarketsReason.IsIdiosyncratic
        : undefined,
  };
}

function getEligibleActions(
  eligibleMarkets: Market[],
  vaultAccount: VaultAccount
) {
  const eligibleActions: VAULT_ACTIONS[] = [];

  // If no maturity, can only create new position
  if (vaultAccount.maturity === 0) {
    return [VAULT_ACTIONS.CREATE_VAULT_POSITION];
  }

  // @follow-up Remove this branch after Notional v3 upgrade
  // If inactive and can settle, allowed to create a new position or withdraw
  // post maturity
  if (vaultAccount.isInactive && vaultAccount.canSettle()) {
    return [
      VAULT_ACTIONS.CREATE_VAULT_POSITION,
      VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY,
    ];
  }

  // Below here, the account has an active position, can always take these three actions
  eligibleActions.push(
    VAULT_ACTIONS.DEPOSIT_COLLATERAL,
    VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
    VAULT_ACTIONS.WITHDRAW_VAULT
  );

  // Matching maturity can increase position
  if (eligibleMarkets.find((m) => m.maturity === vaultAccount.maturity)) {
    eligibleActions.push(VAULT_ACTIONS.INCREASE_POSITION);
  }

  // Mismatch maturity can roll position
  if (eligibleMarkets.find((m) => m.maturity !== vaultAccount.maturity)) {
    eligibleActions.push(VAULT_ACTIONS.ROLL_POSITION);
  }

  return eligibleActions;
}
