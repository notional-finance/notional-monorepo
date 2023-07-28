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
  RATE_PRECISION,
} from '@notional-finance/util';

/**
 * Converts a balance to an out token by exchange to local prime cash and the via the given pool
 * and then doing an FX to the out token in prime cash.
 * @returns localPrime which is always in positive outToken denomination
 * @returns fees which is always in the balance prime cash denomination
 */
function exchangeToLocalPrime(
  balance: TokenBalance | undefined,
  pool: fCashMarket | undefined,
  outToken: TokenDefinition
) {
  if (balance === undefined) {
    return {
      localPrime: TokenBalance.zero(outToken),
      fees: undefined,
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

  if (totalCollateralPrime.isZero()) {
    return {
      netRealizedCollateralBalance,
      collateralBalance: TokenBalance.zero(collateral),
      debtFee,
      collateralFee: totalCollateralPrime.copy(0),
    };
  } else if (collateral.tokenType === 'PrimeCash') {
    return {
      netRealizedCollateralBalance,
      collateralBalance: totalCollateralPrime,
      debtFee,
      collateralFee: totalCollateralPrime.copy(0),
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
  const totalDebtPrime = localDepositPrime.add(localCollateralPrime);
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
    tokensOut[0] = totalDebtPrime;
    const { lpTokens, feesPaid } =
      debtPool.getLPTokensRequiredForTokens(tokensOut);

    return {
      // Signifies redemption required
      debtBalance: lpTokens.neg(),
      debtFee: feesPaid[0],
      collateralFee,
      netRealizedDebtBalance,
    };
  } else if (debt.tokenType === 'fCash') {
    const { tokensOut, feesPaid } = debtPool.calculateTokenTrade(
      totalDebtPrime.neg(),
      debtPool.getTokenIndex(debt)
    );

    return {
      debtBalance: tokensOut.neg(),
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
  depositUnderlying,
  collateralPool,
  debtPool,
  debtBalance,
  collateralBalance,
}: {
  depositUnderlying: TokenDefinition;
  collateralPool?: fCashMarket;
  debtPool?: fCashMarket;
  debtBalance?: TokenBalance;
  collateralBalance?: TokenBalance;
}) {
  const localPrime = Registry.getTokenRegistry().getPrimeCash(
    depositUnderlying.network,
    depositUnderlying.currencyId
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

/**
 * Calculates how much deposit and debt will be required given a collateral balance and a risk limit
 * that the account wants to maintain.
 *
 * @param debt debt denomination
 * @param depositUnderlying deposit denomination
 * @param debtPool required input
 * @param collateralPool required when collateral is fCash or nTokens
 * @param collateralBalance amount of collateral deposit
 * @param balances the account's existing balances
 * @param riskFactorLimit a risk factor limit to adhere to
 */
export function calculateDepositDebtGivenCollateralRiskLimit({
  debt,
  depositUnderlying,
  debtPool,
  collateralPool,
  collateralBalance,
  balances,
  riskFactorLimit,
}: {
  debt: TokenDefinition;
  depositUnderlying: TokenDefinition;
  debtPool: fCashMarket;
  collateralPool: fCashMarket | undefined;
  collateralBalance: TokenBalance;
  balances: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
}) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    depositUnderlying.network,
    depositUnderlying.currencyId
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
  depositUnderlying,
  collateralPool,
  debtPool,
  debtBalance,
  balances,
  riskFactorLimit,
}: {
  collateral: TokenDefinition;
  depositUnderlying: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool: fCashMarket;
  debtBalance: TokenBalance;
  balances: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
}) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    depositUnderlying.network,
    depositUnderlying.currencyId
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

/**
 * Calculates how much debt and collateral will be required given a deposit balance and a risk limit
 * that the account wants to maintain. Can be used to simulate leveraging up or deleveraging.
 */
export function calculateDebtCollateralGivenDepositRiskLimit({
  collateral,
  debt,
  collateralPool,
  debtPool,
  depositBalance,
  balances,
  riskFactorLimit,
  maxCollateralSlippage = 25 * BASIS_POINT,
  maxDebtSlippage = 25 * BASIS_POINT,
}: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  collateralPool: fCashMarket;
  debtPool: fCashMarket;
  depositBalance: TokenBalance | undefined;
  balances?: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
  maxCollateralSlippage?: number;
  maxDebtSlippage?: number;
}) {
  const riskProfile = AccountRiskProfile.simulate(
    balances ? balances : [],
    depositBalance ? [depositBalance] : []
  );

  // NOTE: this calculation is done at spot rates, does not include slippage. Perhaps
  // we should allow manual slippage de-weighting here...
  const { netDebt, netCollateral } =
    riskProfile.getDebtAndCollateralMaintainRiskFactor(
      debt,
      collateral,
      riskFactorLimit
    );

  // Maybe we can calculate the net debt and net collateral using the pools
  // and check how much slippage is incurred and then set a lower bound limit
  // on that here while getting the fees...
  const netCollateralPrimeAtSpot = netCollateral.toPrimeCash();
  const { localPrime: netRealizedCollateralBalance, fees: collateralFee } =
    exchangeToLocalPrime(
      netCollateral,
      collateralPool,
      netCollateralPrimeAtSpot.token
    );

  const netDebtPrimeAtSpot = netDebt.toPrimeCash();
  const { localPrime: netRealizedDebtBalance, fees: debtFee } =
    exchangeToLocalPrime(netDebt, debtPool, netDebtPrimeAtSpot.token);

  if (
    maxCollateralSlippage <
    netCollateralPrimeAtSpot
      .ratioWith(netRealizedCollateralBalance)
      .toNumber() -
      RATE_PRECISION
  ) {
    throw Error('Above max collateral slippage');
  }

  if (
    maxDebtSlippage <
    netRealizedDebtBalance.ratioWith(netDebtPrimeAtSpot).toNumber() -
      RATE_PRECISION
  ) {
    throw Error('Above max debt slippage');
  }

  return {
    collateralBalance: netCollateral,
    debtBalance: netDebt,
    debtFee: debtFee,
    collateralFee,
    netRealizedCollateralBalance: netRealizedCollateralBalance.toUnderlying(),
    netRealizedDebtBalance: netRealizedDebtBalance.toUnderlying(),
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
  maxCollateralSlippage = 25 * BASIS_POINT,
  maxDebtSlippage = 25 * BASIS_POINT,
}: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  vaultAdapter: VaultAdapter;
  debtPool: fCashMarket;
  depositBalance: TokenBalance | undefined;
  balances?: TokenBalance[];
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>;
  maxCollateralSlippage?: number;
  maxDebtSlippage?: number;
}): ReturnType<typeof calculateDebtCollateralGivenDepositRiskLimit> {
  const vaultAddress = collateral.vaultAddress;
  if (!vaultAddress) throw Error('Vault Address not defined');

  const riskProfile = VaultAccountRiskProfile.simulate(
    vaultAddress,
    balances || [TokenBalance.zero(collateral)],
    // This converts the deposit balance to vault shares at spot
    depositBalance ? [depositBalance.toToken(collateral)] : []
  );

  // NOTE: this calculation is done at spot rates, does not include slippage. Perhaps
  // we should allow manual slippage de-weighting here...
  const { netDebt, netCollateral: netVaultShares } =
    riskProfile.getDebtAndCollateralMaintainRiskFactor(
      debt,
      collateral,
      riskFactorLimit
    );

  // netCollateral is in vault shares here, need to determine how much it costs in
  // reality to mint that much collateral and then adjust the debt accordingly.
  const netVaultSharesUnderlyingAtSpot = netVaultShares.toUnderlying();
  const {
    netUnderlyingForVaultShares: netRealizedCollateralBalance,
    feesPaid,
  } = vaultAdapter.getNetVaultSharesCost(netVaultShares);

  const netDebtPrimeAtSpot = netDebt.toPrimeCash();
  const { localPrime: netRealizedDebtBalance, fees: debtFee } =
    exchangeToLocalPrime(netDebt, debtPool, netDebtPrimeAtSpot.token);

  if (
    maxCollateralSlippage <
    netVaultSharesUnderlyingAtSpot
      .ratioWith(netRealizedCollateralBalance)
      .toNumber() -
      RATE_PRECISION
  ) {
    throw Error('Above max collateral slippage');
  }

  if (
    netDebtPrimeAtSpot.isPositive() &&
    maxDebtSlippage <
      netRealizedDebtBalance.ratioWith(netDebtPrimeAtSpot).toNumber() -
        RATE_PRECISION
  ) {
    throw Error('Above max debt slippage');
  }

  return {
    collateralBalance: netVaultShares,
    debtBalance: netDebt, // TODO: need to apply fees here...
    debtFee: debtFee,
    collateralFee: feesPaid,
    netRealizedDebtBalance: netRealizedDebtBalance.toUnderlying(),
    netRealizedCollateralBalance,
  };
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
    const { cashBorrowed } =
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
      debtFee: feesPaid[0],
      collateralFee,
      netRealizedDebtBalance: cashBorrowed.toUnderlying(),
    };
  }
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
  depositBalance: TokenBalance;
  debtBalance: TokenBalance;
}): ReturnType<typeof calculateCollateral> {
  if (debtBalance.tokenType !== 'VaultDebt') throw Error('Invalid inputs');

  const { localPrime: localDebtPrime, fees: debtFee } = exchangeToLocalPrime(
    debtBalance.unwrapVaultToken(),
    debtPool,
    debtBalance.toPrimeCash().token
  );

  const { cashBorrowed } =
    Registry.getConfigurationRegistry().getVaultBorrowWithFees(
      debtBalance.network,
      debtBalance.vaultAddress,
      debtBalance.maturity,
      localDebtPrime
    );
  const totalVaultShares = depositBalance
    .toPrimeCash()
    .add(cashBorrowed)
    .toToken(collateral);

  // This value accounts for slippage...
  const { netUnderlyingForVaultShares, feesPaid } =
    vaultAdapter.getNetVaultSharesCost(totalVaultShares);

  return {
    collateralBalance: netUnderlyingForVaultShares.toToken(
      totalVaultShares.token
    ),
    debtFee,
    collateralFee: feesPaid,
    netRealizedCollateralBalance: depositBalance.add(
      cashBorrowed.toUnderlying()
    ),
  };
}
