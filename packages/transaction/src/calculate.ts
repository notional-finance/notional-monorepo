import {
  fCashMarket,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  RiskFactorKeys,
  RiskFactorLimit,
} from '@notional-finance/risk-engine';
import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';

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

  const { token } = balance;
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
    const { tokensOut, feesPaid } = pool.calculateTokenTrade(balance.neg(), 0);

    return {
      localPrime: tokensOut.toToken(outToken).abs(),
      fees: feesPaid[0],
    };
  }

  throw Error('Unknown token type');
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
export function calculateCollateral(
  collateral: TokenDefinition,
  collateralPool: fCashMarket,
  debtPool?: fCashMarket,
  depositBalance?: TokenBalance,
  debtBalance?: TokenBalance
) {
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

  if (totalCollateralPrime.isZero()) {
    return {
      collateralBalance: TokenBalance.zero(collateral),
      debtFee,
      collateralFee: totalCollateralPrime.copy(0),
    };
  } else if (collateral.tokenType === 'PrimeCash') {
    return {
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
export function calculateDebt(
  debt: TokenDefinition,
  debtPool: fCashMarket,
  collateralPool?: fCashMarket,
  depositBalance?: TokenBalance,
  collateralBalance?: TokenBalance
) {
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

  // Total debt required in prime cash
  const totalDebtPrime = localDepositPrime.add(localCollateralPrime);

  if (totalDebtPrime.isZero()) {
    return {
      debtBalance: TokenBalance.zero(debt),
      debtFee: totalDebtPrime.copy(0),
      collateralFee,
    };
  } else if (debt.tokenType === 'PrimeDebt') {
    return {
      debtBalance: totalDebtPrime.toToken(debt).neg(),
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
    };
  } else if (debt.tokenType === 'fCash') {
    const { tokensOut, feesPaid } = debtPool.calculateTokenTrade(
      totalDebtPrime.neg(),
      debtPool.getTokenIndex(debt)
    );

    return {
      debtBalance: tokensOut,
      debtFee: feesPaid[0],
      collateralFee,
    };
  }

  throw Error('Unknown token type');
}

/**
 * Calculates amount to deposit based on debt and collateral inputs. The outputs are denominated
 * in underlying.
 */
export function calculateDeposit(
  depositUnderlying: TokenDefinition,
  collateralPool?: fCashMarket,
  debtPool?: fCashMarket,
  debtBalance?: TokenBalance,
  collateralBalance?: TokenBalance
) {
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
export function calculateDepositDebtGivenCollateralRiskLimit(
  debt: TokenDefinition,
  depositUnderlying: TokenDefinition,
  debtPool: fCashMarket,
  collateralPool: fCashMarket | undefined,
  collateralBalance: TokenBalance,
  balances: TokenBalance[],
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>
) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    depositUnderlying.network,
    depositUnderlying.currencyId
  );

  const { debtBalance, debtFee, collateralFee } = calculateDebt(
    debt,
    debtPool,
    collateralPool,
    undefined, // Deposit balance is undefined
    collateralBalance
  );

  const riskProfile = AccountRiskProfile.simulate(balances, [
    collateralBalance,
    debtBalance,
  ]);

  const depositBalance = riskProfile
    .getWithdrawRequiredToMaintainRiskFactor(depositPrime, riskFactorLimit)
    .toUnderlying();

  return { depositBalance, debtBalance, debtFee, collateralFee };
}

/**
 * Calculates how much deposit and collateral will be required given a debt balance and a risk limit
 * that the account wants to maintain.
 */
export function calculateDepositCollateralGivenDebtRiskLimit(
  collateral: TokenDefinition,
  depositUnderlying: TokenDefinition,
  collateralPool: fCashMarket,
  debtPool: fCashMarket,
  debtBalance: TokenBalance,
  balances: TokenBalance[],
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>
) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    depositUnderlying.network,
    depositUnderlying.currencyId
  );

  const { collateralBalance, debtFee, collateralFee } = calculateCollateral(
    collateral,
    collateralPool,
    debtPool,
    undefined, // Deposit balance is undefined
    debtBalance
  );

  const riskProfile = AccountRiskProfile.simulate(balances, [
    collateralBalance,
    debtBalance,
  ]);

  const depositBalance = riskProfile
    .getWithdrawRequiredToMaintainRiskFactor(depositPrime, riskFactorLimit)
    .toUnderlying();

  return { depositBalance, collateralBalance, debtFee, collateralFee };
}

/**
 * Calculates how much debt and collateral will be required given a deposit balance and a risk limit
 * that the account wants to maintain. Can be used to simulate leveraging up or deleveraging.
 */
export function calculateDebtCollateralGivenDepositRiskLimit(
  collateral: TokenDefinition,
  debt: TokenDefinition,
  collateralPool: fCashMarket,
  debtPool: fCashMarket,
  depositBalance: TokenBalance | undefined,
  balances: TokenBalance[],
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>,
  maxCollateralSlippage = 25 * BASIS_POINT,
  maxDebtSlippage = 25 * BASIS_POINT
) {
  const riskProfile = AccountRiskProfile.simulate(
    balances,
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
  const { localPrime: localCollateralPrime, fees: collateralFee } =
    exchangeToLocalPrime(
      netCollateral,
      collateralPool,
      netCollateralPrimeAtSpot.token
    );

  const netDebtPrimeAtSpot = netDebt.toPrimeCash();
  const { localPrime: localDebtPrime, fees: debtFee } = exchangeToLocalPrime(
    netDebt,
    debtPool,
    netDebtPrimeAtSpot.token
  );

  if (
    maxCollateralSlippage <
    netCollateralPrimeAtSpot.ratioWith(localCollateralPrime).toNumber() -
      RATE_PRECISION
  ) {
    throw Error('Above max collateral slippage');
  }

  if (
    maxDebtSlippage <
    localDebtPrime.ratioWith(netDebtPrimeAtSpot).toNumber() - RATE_PRECISION
  ) {
    throw Error('Above max debt slippage');
  }

  return {
    collateralBalance: netCollateral,
    debtBalance: netDebt,
    debtFee: debtFee,
    collateralFee,
  };
}
