import { reportNotionalError } from '../../error/error-manager';
import {
  VaultConfig,
  VaultAccount,
  Account,
  VaultFactory,
  BaseVault,
  TypedBigNumber,
  SECONDS_IN_DAY,
  RATE_PRECISION,
} from '@notional-finance/sdk';
import { Market, System } from '@notional-finance/sdk/src/system';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { getNowSeconds, zipByKeyToArray } from '@notional-finance/helpers';
import { NoEligibleMarketsReason, VaultError } from '../vault-action-store';
import { getFullWithdrawAmounts } from './get-withdraw-amount-data';
import { getDefaultLeverageRatio } from './get-default-leverage-ratio';
import { VaultPerformance } from '../vault-store';

interface InitVaultActionDependencies {
  system: System;
  activeVaultMarkets: Map<string, string[]>;
  vaultAddress: string;
  account: Account | null;
  vaultPerformance: Map<string, VaultPerformance>;
  defaultVaultAction: VAULT_ACTIONS;
}

export function getInitVaultAction({
  system,
  account,
  vaultAddress,
  defaultVaultAction,
  activeVaultMarkets,
  vaultPerformance,
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

  let avgBorrowRate: number | undefined;
  let totalCashBorrowed: TypedBigNumber | undefined;
  if (account && account.accountData) {
    ({ avgBorrowRate, totalCashBorrowed } =
      account.accountData.getVaultHistoricalFactors(vaultAddress));
  }

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

  let maxWithdrawAmount: TypedBigNumber | undefined;
  try {
    ({ amountToWallet: maxWithdrawAmount } = getFullWithdrawAmounts(
      baseVault,
      vaultAccount
    ));
  } catch (e) {
    // leave as undefined
  }

  // If there is only one eligible vault action, then set it as the default. A race
  // condition requires setting the leverage ratio as well.
  let leverageRatio: number | undefined = undefined;
  const vaultAction =
    eligibleActions.length === 1 ? eligibleActions[0] : defaultVaultAction;
  if (vaultAction) {
    ({ leverageRatio } = getDefaultLeverageRatio({
      vaultAction,
      baseVault,
      vaultAccount,
      vaultConfig,
    }));
  }

  const { historicalReturns, returnDrivers, sevenDayAverageReturn } =
    getHistoricalReturns(vaultPerformance.get(vaultAddress));

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
    maxWithdrawAmount,
    // Clear inputs back to initial conditions
    vaultAction,
    leverageRatio,
    priorAvgBorrowRate: avgBorrowRate,
    totalCashBorrowed,
    historicalReturns,
    returnDrivers,
    sevenDayAverageReturn,
    error: undefined,
    selectedMarketKey: undefined,
    depositAmount: undefined,
    withdrawAmount: undefined,
    maxWithdraw: undefined,
    transactionCosts: undefined,
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

function getHistoricalReturns(vaultPerformance?: VaultPerformance) {
  if (!vaultPerformance || vaultPerformance.historicalReturns.length == 0) {
    return {
      historicalReturns: [],
      returnDrivers: [],
    };
  }

  const {
    historicalReturns: returns,
    sevenDayReturnDrivers,
    thirtyDayReturnDrivers,
    sevenDayTotalAverage,
    thirtyDayTotalAverage,
  } = vaultPerformance;

  const historicalReturns = returns
    .filter((row) => row['timestamp'] > getNowSeconds() - 90 * SECONDS_IN_DAY)
    .map((row) => {
      const entries = Object.entries(row).filter(([h]) => h !== 'timestamp');
      const totalRate = entries.reduce((sum, [, v]) => sum + v, 0);

      return {
        timestamp: row['timestamp'],
        totalRate,
        // NOTE: this calculate has moved to use-historical returns
        // leveragedReturn: leveragedReturn
        //   ? convertRateToFloat(leveragedReturn)
        //   : undefined,
        breakdown: entries.map(
          ([k, v]) =>
            `${k}: ${Market.formatInterestRate(
              Math.floor((v * RATE_PRECISION) / 100),
              2
            )}`
        ),
      };
    });

  const returnDrivers = zipByKeyToArray(
    sevenDayReturnDrivers,
    thirtyDayReturnDrivers,
    (r) => r.source
  )
    .map(([seven, thirty]) => {
      return {
        // Non-null assertion is valid because of how zipByKeyToArray works
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        source: (seven?.source || thirty?.source)!,
        shortAvg: Market.formatInterestRate(seven?.avg || 0),
        longAvg: Market.formatInterestRate(thirty?.avg || 0),
      };
    })
    .concat({
      source: 'Total Returns',
      shortAvg: Market.formatInterestRate(sevenDayTotalAverage),
      longAvg: Market.formatInterestRate(thirtyDayTotalAverage),
    });

  return {
    historicalReturns,
    returnDrivers,
    sevenDayAverageReturn: sevenDayTotalAverage,
  };
}
