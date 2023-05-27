import {
  AccountDefinition,
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

  if (collateral.tokenType === 'PrimeCash') {
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

  if (debt.tokenType === 'PrimeDebt') {
    return {
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
      debtBalance: lpTokens,
      debtFee: feesPaid[0],
      collateralFee,
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
    };
  }

  throw Error('Unknown token type');
}

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

export function calculateDepositDebtGivenCollateralRiskLimit(
  debt: TokenDefinition,
  depositUnderlying: TokenDefinition,
  collateralPool: fCashMarket,
  debtPool: fCashMarket,
  collateralBalance: TokenBalance,
  account: AccountDefinition,
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>
) {
  const depositPrime = Registry.getTokenRegistry().getPrimeCash(
    depositUnderlying.network,
    depositUnderlying.currencyId
  );

  const { debtBalance, debtFee, collateralFee } = calculateDebt(
    debt,
    collateralPool,
    debtPool,
    undefined, // Deposit balance is undefined
    collateralBalance
  );

  const riskProfile = AccountRiskProfile.simulate(account.balances, [
    collateralBalance,
    debtBalance,
  ]);

  const depositBalance = riskProfile
    .getWithdrawRequiredToMaintainRiskFactor(depositPrime, riskFactorLimit)
    .toUnderlying();

  return { depositBalance, debtBalance, debtFee, collateralFee };
}

export function calculateDepositCollateralGivenDebtRiskLimit(
  collateral: TokenDefinition,
  depositUnderlying: TokenDefinition,
  collateralPool: fCashMarket,
  debtPool: fCashMarket,
  debtBalance: TokenBalance,
  account: AccountDefinition,
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

  const riskProfile = AccountRiskProfile.simulate(account.balances, [
    collateralBalance,
    debtBalance,
  ]);

  const depositBalance = riskProfile
    .getWithdrawRequiredToMaintainRiskFactor(depositPrime, riskFactorLimit)
    .toUnderlying();

  return { depositBalance, collateralBalance, debtFee, collateralFee };
}

export function calculateDebtCollateralGivenDepositRiskLimit(
  collateral: TokenDefinition,
  debt: TokenDefinition,
  _collateralPool: fCashMarket,
  _debtPool: fCashMarket,
  depositBalance: TokenBalance,
  account: AccountDefinition,
  riskFactorLimit: RiskFactorLimit<RiskFactorKeys>
) {
  const riskProfile = AccountRiskProfile.simulate(account.balances, [
    depositBalance,
  ]);

  // TODO: these values are given spot rates, not including slippage...
  const { netDebt, netCollateral } =
    riskProfile.getDebtAndCollateralMaintainRiskFactor(
      debt,
      collateral,
      riskFactorLimit
    );

  return {
    collateralBalance: netCollateral,
    debtBalance: netDebt,
    debtFee: undefined,
    collateralFee: undefined,
  };
}
