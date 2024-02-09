import {
  fCashMarket,
  Registry,
  TokenBalance,
  TokenDefinition,
  VaultAdapter,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  RiskFactorKeys,
  RiskFactorLimit,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  BASIS_POINT,
  PRIME_CASH_VAULT_MATURITY,
  RATE_DECIMALS,
  RATE_PRECISION,
} from '@notional-finance/util';

/**
 * Converts a balance to an out token by exchange to local prime cash and the via the given pool
 * and then doing an FX to the out token in prime cash.
 * @returns localPrime which is always in positive outToken denomination
 * @returns fees which is always in the balance prime cash denomination
 */
export function exchangeToLocalPrime(
  balance: TokenBalance | undefined,
  pool: fCashMarket | undefined,
  outToken: TokenDefinition
) {
  if (balance === undefined) {
    return {
      localPrime: TokenBalance.zero(outToken),
      fees: TokenBalance.zero(outToken),
    };
  }

  const { token } = balance.unwrapVaultToken();
  if (
    token.tokenType === 'PrimeDebt' ||
    token.tokenType === 'PrimeCash' ||
    balance.isZero()
  ) {
    return {
      // Ensure that this returns a positive number to match all the other statements
      localPrime: balance.toToken(outToken).abs(),
      fees: balance.toPrimeCash().copy(0),
    };
  } else if (token.tokenType === 'nToken' && balance.isNegative()) {
    if (!pool) throw Error('Pool is undefined');
    // Redeem nTokens
    const { tokensOut, feesPaid } = pool.getTokensOutGivenLPTokens(
      balance.neg(),
      0
    );

    return {
      localPrime: tokensOut[0].toToken(outToken),
      fees: feesPaid[0],
    };
  } else if (token.tokenType === 'nToken' && balance.isPositive()) {
    if (!pool) throw Error('Pool is undefined');
    // Mint nTokens
    const { tokensIn, feesPaid } = pool.getTokensRequiredForLPTokens(
      balance,
      0
    );

    return {
      localPrime: tokensIn[0].toToken(outToken),
      fees: feesPaid[0],
    };
  } else if (token.tokenType === 'fCash') {
    if (!pool) throw Error('Pool is undefined');
    // Buy or Sell fCash to prime cash, take the opposite of the incoming balance
    const { tokensOut, feesPaid } = pool.calculateTokenTrade(
      balance.unwrapVaultToken().neg(),
      0
    );

    return {
      localPrime: tokensOut.toToken(outToken).abs(),
      fees: feesPaid[0],
    };
  }

  throw Error(`Unknown token type: ${token.tokenType}`);
}

/**
 * Calculates how much collateral will be generated from a debt balance and a deposit. Either debt or
 * deposit or both must be defined. Redeeming nTokens is defined as a "debt balance"
 *
 * @param collateral collateral token to mint
 * @param collateralPool corresponding pool for the collateral token
 * @param debtPool corresponding for the debt pool, can be empty if debt balance is undefined
 * @param depositBalance amount to deposit
 * @param debtBalance amount of debt to create
 * @returns collateralBalance amount of collateral to mint
 * @returns debtFee fees associated with debt
 * @returns collateralFee fees associated with collateral
 */
export function calculateCollateral({
  collateral,
  collateralPool,
  debtPool,
  depositBalance,
  debtBalance,
}: {
  collateral: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool?: fCashMarket;
  depositBalance?: TokenBalance;
  debtBalance?: TokenBalance;
}) {
  const tokens = Registry.getTokenRegistry();
  const collateralUnderlying = tokens.getUnderlying(
    collateral.network,
    collateral.currencyId
  );
  const localPrime = Registry.getTokenRegistry().getPrimeCash(
    collateralUnderlying.network,
    collateralUnderlying.currencyId
  );

  const { localPrime: localDebtPrime, fees: debtFee } = exchangeToLocalPrime(
    debtBalance,
    debtPool,
    localPrime
  );

  const localDepositPrime = depositBalance
    ? depositBalance.toToken(localPrime)
    : TokenBalance.zero(localPrime);

  // Total collateral required in prime cash
  const totalCollateralPrime = localDepositPrime.add(localDebtPrime);
  const netRealizedCollateralBalance = totalCollateralPrime.toUnderlying();
  const netRealizedDebtBalance = localDebtPrime.toUnderlying().neg();

  if (totalCollateralPrime.isZero()) {
    return {
      netRealizedCollateralBalance,
      collateralBalance: TokenBalance.zero(collateral),
      debtFee,
      collateralFee: totalCollateralPrime.copy(0),
      netRealizedDebtBalance,
    };
  } else if (collateral.tokenType === 'PrimeCash') {
    return {
      netRealizedCollateralBalance,
      collateralBalance: totalCollateralPrime,
      debtFee,
      collateralFee: totalCollateralPrime.copy(0),
      netRealizedDebtBalance,
    };
  } else if (collateral.tokenType === 'nToken') {
    const tokensIn = collateralPool.zeroTokenArray();
    tokensIn[0] = totalCollateralPrime;
    const { lpTokens, feesPaid } =
      collateralPool.getLPTokensGivenTokens(tokensIn);

    return {
      netRealizedCollateralBalance,
      collateralBalance: lpTokens,
      debtFee,
      collateralFee: feesPaid[0],
      netRealizedDebtBalance,
    };
  } else if (collateral.tokenType === 'fCash') {
    const { tokensOut, feesPaid } = collateralPool.calculateTokenTrade(
      totalCollateralPrime,
      collateralPool.getTokenIndex(collateral)
    );

    return {
      netRealizedCollateralBalance,
      collateralBalance: tokensOut,
      debtFee,
      collateralFee: feesPaid[0],
      netRealizedDebtBalance,
    };
  }

  throw Error('Unknown token type');
}

/**
 *
 * Calculates how much debt will be generated from a collateral balance and a deposit. Either collateral or
 * deposit balance or both must be defined.
 *
 * @param debt debt token to mint
 * @param debtPool corresponding for the debt pool, can be empty if debt balance is undefined
 * @param collateralPool corresponding pool for the collateral token
 * @param depositBalance amount to deposit
 * @param collateralBalance amount of collateral to mint
 * @returns debtBalance amount of debt to mint
 * @returns debtFee fees associated with debt
 * @returns collateralFee fees associated with collateral
 */
export function calculateDebt({
  debt,
  debtPool,
  collateralPool,
  depositBalance,
  collateralBalance,
}: {
  debt: TokenDefinition;
  debtPool: fCashMarket;
  collateralPool?: fCashMarket;
  depositBalance?: TokenBalance;
  collateralBalance?: TokenBalance;
}) {
  const tokens = Registry.getTokenRegistry();
  const debtUnderlying = tokens.getUnderlying(debt.network, debt.currencyId);
  const localPrime = tokens.getPrimeCash(
    debtUnderlying.network,
    debtUnderlying.currencyId
  );

  const { localPrime: localCollateralPrime, fees: collateralFee } =
    exchangeToLocalPrime(collateralBalance, collateralPool, localPrime);

  const localDepositPrime = depositBalance
    ? depositBalance.toToken(localPrime)
    : TokenBalance.zero(localPrime);

  // Total debt required in prime cash. If deposit < 0 then this will be
  // a withdraw and totalDebtPrime will be negative.
  const totalDebtPrime = localDepositPrime.add(localCollateralPrime.neg());
  const netRealizedDebtBalance = totalDebtPrime.toUnderlying();

  if (totalDebtPrime.isZero()) {
    return {
      netRealizedDebtBalance,
      debtBalance: TokenBalance.zero(debt),
      debtFee: totalDebtPrime.copy(0),
      collateralFee,
    };
  } else if (debt.tokenType === 'PrimeDebt') {
    return {
      netRealizedDebtBalance,
      debtBalance: totalDebtPrime.toToken(debt),
      debtFee: totalDebtPrime.copy(0),
      collateralFee,
    };
  } else if (debt.tokenType === 'nToken') {
    // Redeem nToken
    const tokensOut = debtPool.zeroTokenArray();
    // NOTE: tokensOut[0] is positive
    tokensOut[0] = totalDebtPrime.neg();
    const { lpTokens, feesPaid } =
      debtPool.getLPTokensRequiredForTokens(tokensOut);

    return {
      // NOTE: lpTokens is positive here, negate it to represent redemption
      debtBalance: lpTokens.neg(),
      debtFee: feesPaid[0],
      collateralFee,
      netRealizedDebtBalance,
    };
  } else if (debt.tokenType === 'fCash') {
    const { tokensOut, feesPaid } = debtPool.calculateTokenTrade(
      totalDebtPrime, // NOTE: this is negative because net cash to the pool is negative
      debtPool.getTokenIndex(debt)
    );

    return {
      // TokensOut is negative for the debt balance
      debtBalance: tokensOut,
      debtFee: feesPaid[0],
      collateralFee,
      netRealizedDebtBalance,
    };
  }

  throw Error('Unknown token type');
}

/**
 * Calculates amount to deposit based on debt and collateral inputs. The outputs are denominated
 * in underlying.
 */
export function calculateDeposit({
  deposit,
  collateralPool,
  debtPool,
  debtBalance,
  collateralBalance,
}: {
  deposit: TokenDefinition;
  collateralPool?: fCashMarket;
  debtPool?: fCashMarket;
  debtBalance?: TokenBalance;
  collateralBalance?: TokenBalance;
}) {
  const localPrime = Registry.getTokenRegistry().getPrimeCash(
    deposit.network,
    deposit.currencyId
  );

  const { localPrime: localCollateralPrime, fees: collateralFee } =
    exchangeToLocalPrime(collateralBalance, collateralPool, localPrime);
  const { localPrime: localDebtPrime, fees: debtFee } = exchangeToLocalPrime(
    debtBalance,
    debtPool,
    localPrime
  );

  return {
    // Need to deposit the difference between these to figures
    depositBalance: localCollateralPrime.sub(localDebtPrime).toUnderlying(),
    collateralFee,
    debtFee,
  };
}
export function calculateConvertAsset(
  i: Parameters<typeof calculateCollateral>[0]
) {
  const c = calculateCollateral(i);

  if (
    i.debtBalance?.tokenType === 'PrimeDebt' ||
    c.collateralBalance.tokenType === 'fCash'
  ) {
    // If repaying prime debt, borrow slightly more to ensure that we cover the interest accrued
    // and then withdraw all the excess cash balance. Because we are rolling the debt there should
    // result in a zero cash balance.
    c.collateralBalance = c.collateralBalance.mulInRatePrecision(
      RATE_PRECISION - 5 * BASIS_POINT
    );
  }

  return c;
}

export function calculateRollDebt(i: Parameters<typeof calculateDebt>[0]) {
  const d = calculateDebt(i);

  if (
    i.collateralBalance?.tokenType === 'PrimeCash' ||
    d.debtBalance.tokenType === 'fCash'
  ) {
    // If repaying prime debt, borrow slightly more to ensure that we cover the interest accrued
    // and then withdraw all the excess cash balance. Because we are rolling the debt there should
    // result in a zero cash balance.
    d.debtBalance = d.debtBalance.mulInRatePrecision(
      RATE_PRECISION + 5 * BASIS_POINT
    );
  }

  return d;
}

/**
 * Calculates how much deposit and debt will be required given a collateral balance and a risk limit
 * that the account wants to maintain.
 *
 * @param debt debt denomination
 * @param deposit deposit denomination
 * @param debtPool required input
 * @param collateralPool required when collateral is fCash or nTokens
 * @param collateralBalance amount of collateral deposit
 * @param balances the account's existing balances
 * @param riskFactorLimit a risk factor limit to adhere to
 */
export function calculateDepositDebtGivenCollateralRiskLimit({
  debt,
  deposit,
  debtPool,
  collateralPool,
  collateralBalance,
  balances,
  riskFactorLimit,
}: {
  debt: TokenDefinition;
  deposit: TokenDefinition;
  debtPool: fCashMarket;
  collateralPool: fCashMarket | undefined;
  collateralBalance: TokenBalance;
  balances: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
}) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    deposit.network,
    deposit.currencyId
  );

  const { debtBalance, debtFee, collateralFee, netRealizedDebtBalance } =
    calculateDebt({
      debt,
      debtPool,
      collateralPool,
      depositBalance: undefined,
      collateralBalance,
    });

  const riskProfile = AccountRiskProfile.simulate(balances, [
    collateralBalance,
    debtBalance,
  ]);

  const depositBalance = riskProfile
    .getWithdrawRequiredToMaintainRiskFactor(depositPrime, riskFactorLimit)
    .toUnderlying();

  return {
    depositBalance,
    debtBalance,
    debtFee,
    collateralFee,
    netRealizedDebtBalance,
  };
}

/**
 * Calculates how much deposit and collateral will be required given a debt balance and a risk limit
 * that the account wants to maintain.
 */
export function calculateDepositCollateralGivenDebtRiskLimit({
  collateral,
  deposit,
  collateralPool,
  debtPool,
  debtBalance,
  balances,
  riskFactorLimit,
}: {
  collateral: TokenDefinition;
  deposit: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool: fCashMarket;
  debtBalance: TokenBalance;
  balances: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
}) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    deposit.network,
    deposit.currencyId
  );

  const {
    collateralBalance,
    debtFee,
    collateralFee,
    netRealizedCollateralBalance,
  } = calculateCollateral({
    collateral,
    collateralPool,
    debtPool,
    depositBalance: undefined,
    debtBalance,
  });

  const riskProfile = AccountRiskProfile.simulate(balances, [
    collateralBalance,
    debtBalance,
  ]);

  const depositBalance = riskProfile
    .getWithdrawRequiredToMaintainRiskFactor(depositPrime, riskFactorLimit)
    .toUnderlying();

  return {
    depositBalance,
    collateralBalance,
    debtFee,
    collateralFee,
    netRealizedCollateralBalance,
  };
}

export function calculateDeleverage({
  collateral,
  debt,
  collateralPool,
  debtPool,
  collateralBalance,
  debtBalance,
}: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool: fCashMarket;
  collateralBalance: TokenBalance;
  debtBalance: TokenBalance;
}) {
  if (!collateralBalance.isZero() && debtBalance.isZero()) {
    // If repaying prime debt (when collateralBalance == prime cash), then adjust
    // the value up a bit to reduce the chance of having dust balances at the max
    if (collateralBalance.tokenType === 'PrimeCash') {
      collateralBalance = collateralBalance.mulInRatePrecision(
        RATE_PRECISION + 5 * BASIS_POINT
      );
    }

    return {
      collateralBalance,
      ...calculateDebt({
        debt,
        debtPool,
        collateralPool,
        collateralBalance,
      }),
    };
  } else if (!debtBalance.isZero() && collateralBalance.isZero()) {
    return calculateCollateral({
      collateral,
      debtPool,
      collateralPool,
      debtBalance,
    });
  } else {
    // NOTE: if both values are defined just return them
    return { debtBalance, collateralBalance };
  }
}

export function calculateDeleverageWithdraw(i: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool: fCashMarket;
  depositBalance: TokenBalance | undefined;
  balances?: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
  maxWithdraw?: boolean;
  collateralBalance?: TokenBalance;
  debtBalance?: TokenBalance;
}) {
  if (i.maxWithdraw) return calculateCollateral(i);

  return calculateDebtCollateralGivenDepositRiskLimit(i);
}

export function calculateDebtCollateralGivenDepositRiskLimit({
  collateral,
  debt,
  collateralPool,
  debtPool,
  depositBalance,
  balances,
  riskFactorLimit,
}: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool: fCashMarket;
  depositBalance: TokenBalance | undefined;
  balances?: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
}) {
  let initialDebtUnitsEstimateInRP = RATE_PRECISION;
  let debtDeposit: ReturnType<typeof calculateDebt> | undefined;
  let collateralDeposit: ReturnType<typeof calculateCollateral> | undefined;
  let profile = new AccountRiskProfile(balances || [], collateral.network);
  let initialGuessMultiple: number | undefined = undefined;

  if (depositBalance?.isPositive()) {
    collateralDeposit = calculateCollateral({
      collateral,
      collateralPool,
      depositBalance,
    });
    const limitInRP = profile.getRiskFactorInRP(
      riskFactorLimit.riskFactor,
      riskFactorLimit.limit
    );
    initialDebtUnitsEstimateInRP = depositBalance
      .mulInRatePrecision(limitInRP)
      .scaleTo(RATE_DECIMALS)
      .toNumber();

    profile = profile.simulate([collateralDeposit.collateralBalance]);
  } else if (depositBalance?.isNegative()) {
    debtDeposit = calculateDebt({ debt, debtPool, depositBalance });
    const withdrawPortion = depositBalance
      .neg()
      .ratioWith(
        profile
          .totalCurrencyAssets(
            depositBalance.currencyId,
            depositBalance.currencyId
          )
          .add(
            profile.totalCurrencyDebts(
              depositBalance.currencyId,
              depositBalance.currencyId
            )
          )
      );
    initialDebtUnitsEstimateInRP = profile
      .totalDebt(depositBalance.currencyId)
      .neg()
      .mulInRatePrecision(withdrawPortion)
      .scaleTo(RATE_DECIMALS)
      .toNumber();

    profile = profile.simulate([debtDeposit.debtBalance]);
    // Reduces the chance that the withdraw exceeds the total balance, however,
    // above a certain threshold this may try to withdraw above the absolute balance
    // of the collateral token.
    initialGuessMultiple = 1 - withdrawPortion.toNumber() / RATE_PRECISION + 1;
  }

  const results = profile.getDebtAndCollateralMaintainRiskFactor(
    debt,
    riskFactorLimit,
    (debtBalance: TokenBalance) => {
      return calculateCollateral({
        collateral,
        collateralPool,
        debtPool,
        debtBalance,
      });
    },
    initialDebtUnitsEstimateInRP,
    initialGuessMultiple
  );

  return {
    ...results,
    ...(collateralDeposit
      ? {
          collateralBalance: results.collateralBalance.add(
            collateralDeposit.collateralBalance
          ),
          collateralFee: results.collateralFee.add(
            collateralDeposit.collateralFee
          ),
          netRealizedCollateralBalance:
            results.netRealizedCollateralBalance.add(
              collateralDeposit.netRealizedCollateralBalance
            ),
        }
      : {}),
    ...(debtDeposit
      ? {
          debtBalance: results.debtBalance.add(debtDeposit.debtBalance),
          debtFee: results.debtFee.add(debtDeposit.debtFee),
          netRealizedDebtBalance: results.netRealizedDebtBalance.add(
            debtDeposit.netRealizedDebtBalance
          ),
        }
      : {}),
  };
}

/**
 * Calculates vault debt and collateral given a risk limit
 */
export function calculateVaultDebtCollateralGivenDepositRiskLimit({
  collateral,
  debt,
  vaultAdapter,
  debtPool,
  depositBalance,
  balances,
  riskFactorLimit,
  vaultLastUpdateTime,
  maxCollateralSlippage,
}: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  vaultAdapter: VaultAdapter;
  debtPool: fCashMarket;
  depositBalance: TokenBalance | undefined;
  vaultLastUpdateTime?: number;
  balances?: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
  maxCollateralSlippage?: number;
  maxDebtSlippage?: number;
}): ReturnType<typeof calculateDebtCollateralGivenDepositRiskLimit> {
  const vaultAddress = collateral.vaultAddress;
  if (!vaultAddress) throw Error('Vault Address not defined');

  let profile = new VaultAccountRiskProfile(
    vaultAddress,
    balances || [TokenBalance.zero(collateral)],
    vaultLastUpdateTime || 0
  );

  let initialDebtUnitsEstimateInRP = RATE_PRECISION;
  let netVaultSharesForWithdraw: TokenBalance | undefined;
  if (depositBalance?.isPositive()) {
    // Initial estimate if deposit is positive is the deposit * leverageRatio
    const limitInRP = profile.getRiskFactorInRP(
      riskFactorLimit.riskFactor,
      riskFactorLimit.limit
    );
    initialDebtUnitsEstimateInRP = depositBalance
      .mulInRatePrecision(limitInRP)
      .scaleTo(RATE_DECIMALS)
      .toNumber();
  } else if (depositBalance?.isNegative()) {
    // Estimate of the debt to repay is:
    // withdrawalPortion = withdrawAmount / netWorth
    // repayAmount = withdrawalPortion * debts
    const withdrawPortion = depositBalance.neg().ratioWith(profile.netWorth());
    initialDebtUnitsEstimateInRP = profile
      .totalDebtRiskAdjusted()
      .mulInRatePrecision(withdrawPortion)
      .scaleTo(RATE_DECIMALS)
      .toNumber();

    ({ netVaultSharesForUnderlying: netVaultSharesForWithdraw } =
      vaultAdapter.getNetVaultSharesMinted(depositBalance, collateral));
    profile = profile.simulate([netVaultSharesForWithdraw]);
  }
  const accruedVaultFees = profile.accruedVaultFees;

  const results = profile.getDebtAndCollateralMaintainRiskFactor(
    debt,
    riskFactorLimit,
    (debtBalance: TokenBalance) => {
      // NOTE: any borrowed cash is first net off against the prime debt fees
      // accrued before the vault collateral is purchased
      if (debtBalance.maturity === PRIME_CASH_VAULT_MATURITY)
        debtBalance = debtBalance.add(accruedVaultFees);

      return calculateVaultCollateral({
        collateral,
        vaultAdapter,
        debtPool,
        debtBalance,
        depositBalance,
      });
    },
    initialDebtUnitsEstimateInRP
  );

  let collateralBalance = (
    netVaultSharesForWithdraw
      ? results.collateralBalance.add(netVaultSharesForWithdraw)
      : results.collateralBalance
  )
    // Buffer the collateral balance to account for slippage or precision loss
    .mulInRatePrecision(
      RATE_PRECISION + (maxCollateralSlippage || BASIS_POINT)
    );

  // Do not allow the collateral balance withdrawn to exceed the actual account balance
  if (
    collateralBalance.isNegative() &&
    collateralBalance.abs().gt(profile.vaultShares)
  ) {
    collateralBalance = profile.vaultShares;
  }

  return {
    ...results,
    collateralBalance,
  };
}

export function calculateVaultRoll({
  debt,
  debtPool,
  depositBalance,
  balances,
  vaultLastUpdateTime,
}: {
  debt: TokenDefinition;
  debtPool: fCashMarket;
  vaultAdapter: VaultAdapter;
  depositBalance: TokenBalance;
  balances: TokenBalance[];
  vaultLastUpdateTime: number;
}) {
  // Collateral balance is predefined
  if (!debt.vaultAddress) throw Error('Vault Debt not defined');
  // Settles balances inside
  const profile = new VaultAccountRiskProfile(
    debt.vaultAddress,
    balances,
    vaultLastUpdateTime
  );
  const collateralBalance = profile.vaultShares;
  const currentDebt = profile.vaultDebt;
  if (!collateralBalance) throw Error('Vault Shares not defined');
  if (!currentDebt) throw Error('Vault Debt not defined');
  const tokens = Registry.getTokenRegistry();

  // eslint-disable-next-line prefer-const
  let { localPrime: costToRepay, fees: currentDebtFee } = exchangeToLocalPrime(
    currentDebt.unwrapVaultToken().neg(),
    Registry.getExchangeRegistry().getfCashMarket(
      currentDebt.network,
      currentDebt.currencyId
    ),
    tokens.getPrimeCash(currentDebt.network, currentDebt.currencyId)
  );

  const netCostToRepay = costToRepay
    // Vault fees only accrue for prime debt
    .add(profile.accruedVaultFees.toPrimeCash())
    .sub(depositBalance.toPrimeCash());

  if (debt.maturity === PRIME_CASH_VAULT_MATURITY) {
    const pDebt = tokens.getPrimeDebt(debt.network, debt.currencyId);

    return {
      netRealizedDebtBalance: netCostToRepay.toUnderlying(),
      debtBalance: TokenBalance.from(netCostToRepay.toToken(pDebt).n, debt),
      debtFee: currentDebtFee,
      collateralFee: currentDebtFee.copy(0),
      // NOTE: this undershoots the actual vault share amount
      collateralBalance: TokenBalance.from(
        collateralBalance.n,
        tokens.getVaultShare(debt.network, debt.vaultAddress, debt.maturity)
      ),
    };
  } else if (debt.maturity) {
    // If fCash, need to account for additional borrow fee
    const { feeRate } =
      Registry.getConfigurationRegistry().getVaultBorrowWithFees(
        debt.network,
        debt.vaultAddress,
        debt.maturity,
        netCostToRepay
      );

    const totalPrimeCashRequired = netCostToRepay.scale(
      RATE_PRECISION,
      RATE_PRECISION - feeRate
    );
    const { tokensOut, feesPaid } = debtPool.calculateTokenTrade(
      totalPrimeCashRequired.neg(), // NOTE: this is negative because net cash to the pool is negative
      debtPool.getTokenIndex(tokens.unwrapVaultToken(debt))
    );

    return {
      // TokensOut is negative for the debt balance
      debtBalance: TokenBalance.from(tokensOut.n, debt),
      debtFee: feesPaid[0].add(currentDebtFee),
      collateralFee: feesPaid[0].copy(0),
      netRealizedDebtBalance: totalPrimeCashRequired.toUnderlying(),
      // NOTE: this undershoots the actual vault share amount
      collateralBalance: TokenBalance.from(
        collateralBalance.n,
        tokens.getVaultShare(debt.network, debt.vaultAddress, debt.maturity)
      ),
    };
  }

  throw Error('Unknown debt token');
}

export function calculateVaultDebt({
  debt,
  debtPool,
  vaultAdapter,
  depositBalance,
  collateralBalance,
}: {
  debt: TokenDefinition;
  debtPool: fCashMarket;
  vaultAdapter: VaultAdapter;
  depositBalance: TokenBalance;
  collateralBalance: TokenBalance;
}): ReturnType<typeof calculateDebt> {
  if (
    debt.tokenType !== 'VaultDebt' ||
    collateralBalance.tokenType !== 'VaultShare' ||
    debt.vaultAddress === undefined ||
    debt.maturity === undefined ||
    debt.vaultAddress !== collateralBalance.token.vaultAddress
  )
    throw Error('Invalid inputs');

  // This is all done at spot rates, this does not account for slippage...
  const totalDebtPrime = depositBalance
    .toPrimeCash()
    .add(collateralBalance.toPrimeCash());
  const { feesPaid: collateralFee } =
    vaultAdapter.getNetVaultSharesCost(collateralBalance);

  if (totalDebtPrime.isZero()) {
    return {
      debtBalance: TokenBalance.zero(debt),
      debtFee: totalDebtPrime.copy(0),
      collateralFee,
      netRealizedDebtBalance: TokenBalance.zero(debt).toUnderlying(),
    };
  } else if (debt.maturity === PRIME_CASH_VAULT_MATURITY) {
    return {
      // Prime Vault Debt is denominated in PrimeDebt terms
      debtBalance: TokenBalance.from(totalDebtPrime.neg().n, debt),
      debtFee: totalDebtPrime.copy(0),
      collateralFee,
      netRealizedDebtBalance: totalDebtPrime.toUnderlying(),
    };
  } else {
    const fCashToken = TokenBalance.unit(debt).unwrapVaultToken().token;
    const { cashBorrowed, vaultFee } =
      Registry.getConfigurationRegistry().getVaultBorrowWithFees(
        debt.network,
        debt.vaultAddress,
        debt.maturity,
        totalDebtPrime.neg()
      );
    const { tokensOut, feesPaid } = debtPool.calculateTokenTrade(
      // Returns the total cash required including value fees
      cashBorrowed,
      debtPool.getTokenIndex(fCashToken)
    );

    return {
      debtBalance: TokenBalance.from(tokensOut.n, debt),
      debtFee: feesPaid[0].add(vaultFee),
      collateralFee,
      netRealizedDebtBalance: cashBorrowed.toUnderlying(),
    };
  }
}

export function calculateVaultDeposit({
  collateral,
  vaultAdapter,
  depositBalance,
}: {
  collateral: TokenDefinition;
  vaultAdapter: VaultAdapter;
  depositBalance: TokenBalance;
}): ReturnType<typeof calculateCollateral> {
  const { netVaultSharesForUnderlying, feesPaid } =
    vaultAdapter.getNetVaultSharesMinted(depositBalance, collateral);

  return {
    collateralBalance: netVaultSharesForUnderlying,
    debtFee: depositBalance.toPrimeCash().copy(0),
    collateralFee: feesPaid,
    netRealizedCollateralBalance: depositBalance,
    netRealizedDebtBalance: depositBalance.copy(0),
  };
}

export function calculateVaultCollateral({
  collateral,
  vaultAdapter,
  debtPool,
  depositBalance,
  debtBalance,
}: {
  collateral: TokenDefinition;
  vaultAdapter: VaultAdapter;
  debtPool: fCashMarket;
  debtBalance: TokenBalance;
  depositBalance?: TokenBalance;
}): ReturnType<typeof calculateCollateral> {
  if (debtBalance.tokenType !== 'VaultDebt') throw Error('Invalid inputs');

  const { localPrime: localDebtPrime, fees: debtFee } = exchangeToLocalPrime(
    debtBalance.unwrapVaultToken(),
    debtPool,
    debtBalance.toPrimeCash().token
  );

  const { cashBorrowed, vaultFee } =
    Registry.getConfigurationRegistry().getVaultBorrowWithFees(
      debtBalance.network,
      debtBalance.vaultAddress,
      debtBalance.maturity,
      localDebtPrime
    );

  const netRealizedCollateralBalance = debtBalance.isNegative()
    ? (depositBalance || cashBorrowed.toUnderlying().copy(0)).add(
        cashBorrowed.toUnderlying()
      )
    : localDebtPrime.toUnderlying().neg();

  // This value accounts for slippage...
  const { netVaultSharesForUnderlying, feesPaid } =
    vaultAdapter.getNetVaultSharesMinted(
      netRealizedCollateralBalance,
      collateral
    );

  return {
    collateralBalance: netVaultSharesForUnderlying,
    debtFee: debtFee.add(
      debtBalance.isNegative() ? vaultFee : vaultFee.copy(0)
    ),
    collateralFee: feesPaid,
    netRealizedCollateralBalance,
    netRealizedDebtBalance: cashBorrowed.neg().toUnderlying(),
  };
}
