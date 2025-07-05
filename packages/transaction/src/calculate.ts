import {
  fCashMarket,
  SNOTEWeightedPool,
  TokenBalance,
  TokenDefinition,
  VaultAdapter,
  getNetworkModel,
} from '@notional-finance/core-entities';
import {
  RiskFactorKeys,
  RiskFactorLimit,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  BASIS_POINT,
  Network,
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
      netRealized: TokenBalance.zero(outToken).toUnderlying(),
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
      netRealized: balance.toToken(outToken).toUnderlying().abs(),
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
      netRealized: tokensOut[0].add(feesPaid[0]).toUnderlying(),
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
      netRealized: balance.toPrimeCash().sub(feesPaid[0]).toUnderlying(),
    };
  } else if (token.tokenType === 'fCash') {
    if (!pool) throw Error('Pool is undefined');
    // Buy or Sell fCash to prime cash, take the opposite of the incoming balance
    const b = balance.unwrapVaultToken().neg();
    const { tokensOut, feesPaid } = pool.calculateTokenTrade(b, 0);

    return {
      localPrime: tokensOut.toToken(outToken).abs(),
      fees: feesPaid[0],
      netRealized:
        b.tokenType === 'PrimeCash'
          ? // in this case it is lending
            b.sub(feesPaid[0]).toUnderlying()
          : // in this case it is borrowing
            tokensOut.add(feesPaid[0]).toUnderlying(),
    };
  }

  throw Error(`Unknown token type: ${token.tokenType}`);
}

/**
 * Calculates vault debt and collateral given a risk limit
 */
// TODO: this is used for everything else
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
}) {
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
  } else if (!profile.vaultDebt.isZero()) {
    initialDebtUnitsEstimateInRP = Math.floor(
      (profile.vaultDebt.toFloat() * RATE_PRECISION) / 2
    );
  }
  const accruedVaultFees = profile.accruedVaultFees;

  // Ensure that the debt passed in matches the collateral, this can occur when calculating
  // collateral options
  debt =
    collateral.vaultAddress && collateral.maturity
      ? getNetworkModel(collateral.network).getVaultDebt(
          collateral.vaultAddress,
          collateral.maturity
        )
      : debt;

  const results = profile.getDebtAndCollateralMaintainRiskFactor(
    debt,
    riskFactorLimit,
    (debtBalance: TokenBalance) => {
      // NOTE: any borrowed cash is first net off against the prime debt fees
      // accrued before the vault collateral is purchased
      if (
        debtBalance.maturity === PRIME_CASH_VAULT_MATURITY &&
        !accruedVaultFees.isZero()
      )
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

// TODO: this is used for migration
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
  const model = getNetworkModel(debt.network);

  // TODO: this needs to be updated to use a more generic debt market
  // eslint-disable-next-line prefer-const
  let { localPrime: costToRepay, fees: currentDebtFee } = exchangeToLocalPrime(
    currentDebt.unwrapVaultToken().neg(),
    model.getfCashMarket(currentDebt.currencyId),
    model.getPrimeCash(currentDebt.currencyId)
  );

  const netCostToRepay = costToRepay
    // Vault fees only accrue for prime debt
    .add(profile.accruedVaultFees.toPrimeCash())
    .sub(depositBalance.toPrimeCash());

  if (debt.maturity === PRIME_CASH_VAULT_MATURITY) {
    const pDebt = model.getPrimeDebt(debt.currencyId);
    // NOTE: this undershoots the actual vault share amount
    const newVaultShares = TokenBalance.from(
      collateralBalance.n,
      model.getVaultShare(debt.vaultAddress, debt.maturity)
    );

    return {
      netRealizedDebtBalance: netCostToRepay.toUnderlying().neg(),
      debtBalance: TokenBalance.from(
        netCostToRepay.toToken(pDebt).n,
        debt
      ).neg(),
      // This is the cost to exit the fixed debt
      debtFee: currentDebtFee,
      collateralFee: currentDebtFee.copy(0),
      netRealizedCollateralBalance: newVaultShares.toUnderlying(),
      collateralBalance: newVaultShares,
    };
  } else if (debt.maturity) {
    // If fCash, need to account for additional borrow fee
    const { feeRate } = model.getVaultBorrowWithFees(
      debt.vaultAddress,
      debt.maturity,
      netCostToRepay
    );

    const totalPrimeCashRequired = netCostToRepay.scale(
      RATE_PRECISION,
      RATE_PRECISION - feeRate
    );
    const vaultFee = totalPrimeCashRequired.sub(netCostToRepay);

    const { tokensOut, feesPaid } = debtPool.calculateTokenTrade(
      totalPrimeCashRequired.neg(), // NOTE: this is negative because net cash to the pool is negative
      debtPool.getTokenIndex(model.unwrapVaultToken(debt))
    );
    // NOTE: this undershoots the actual vault share amount
    const newVaultShares = TokenBalance.from(
      collateralBalance.n,
      model.getVaultShare(debt.vaultAddress, debt.maturity)
    );

    return {
      // TokensOut is negative for the debt balance
      debtBalance: TokenBalance.from(tokensOut.n, debt),
      debtFee: feesPaid[0].add(currentDebtFee).add(vaultFee),
      collateralFee: feesPaid[0].copy(0),
      netRealizedDebtBalance: totalPrimeCashRequired
        .add(feesPaid[0])
        .toUnderlying()
        .neg(),
      netRealizedCollateralBalance: newVaultShares.toUnderlying(),
      collateralBalance: newVaultShares,
    };
  }

  throw Error('Unknown debt token');
}

function calculateVaultCollateral({
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
}) {
  if (debtBalance.tokenType !== 'VaultDebt') throw Error('Invalid inputs');

  // TODO: this needs to be updated to use a more generic debt market
  const { localPrime: localDebtPrime, fees: debtFee } = exchangeToLocalPrime(
    debtBalance.unwrapVaultToken(),
    debtPool,
    debtBalance.toPrimeCash().token
  );

  const { cashBorrowed, vaultFee } = getNetworkModel(
    debtBalance.network
  ).getVaultBorrowWithFees(
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
  const { netVaultSharesForUnderlying, feesPaid, vaultTradeMetadata } =
    vaultAdapter.getNetVaultSharesMinted(
      netRealizedCollateralBalance,
      collateral
    );

  const totalDebtFees = debtFee.add(
    debtBalance.isNegative() ? vaultFee : vaultFee.copy(0)
  );

  return {
    collateralBalance: netVaultSharesForUnderlying,
    debtFee: totalDebtFees,
    collateralFee: feesPaid,
    netRealizedCollateralBalance: debtBalance.isNegative()
      ? netRealizedCollateralBalance.sub(feesPaid.toUnderlying())
      : netRealizedCollateralBalance.add(feesPaid.toUnderlying()),
    // This properly accounts for the borrow fee in the trade summary
    netRealizedDebtBalance: localDebtPrime.add(debtFee).neg().toUnderlying(),
    vaultTradeMetadata,
  };
}

export function calculateStake({
  collateralPool,
  deposit,
  depositBalance,
  secondaryDepositBalance,
  useOptimalETH,
}: {
  collateralPool: SNOTEWeightedPool;
  deposit?: TokenDefinition;
  depositBalance?: TokenBalance;
  secondaryDepositBalance?: TokenBalance;
  useOptimalETH: boolean;
}) {
  const mainnet = getNetworkModel(Network.mainnet);
  const ETH = mainnet.getTokenBySymbol('ETH');
  const NOTE = mainnet.getTokenBySymbol('NOTE');
  const noteIn = secondaryDepositBalance || TokenBalance.zero(NOTE);
  const ethIn = useOptimalETH
    ? collateralPool.getOptimumETHForNOTE(noteIn)
    : depositBalance || TokenBalance.zero(ETH);

  if (ethIn.isZero() && noteIn.isZero()) {
    // Clear outputs if there is no value
    return {
      collateralBalance: undefined,
      collateralFee: undefined,
      netRealizedCollateralBalance: undefined,
      postTradeBalances: undefined,
    };
  }

  const { lpTokens, feesPaid } = collateralPool.getLPTokensGivenTokens([
    ethIn.toToken(ETH),
    noteIn,
  ]);

  const collateralBalance = collateralPool.getSNOTEForBPT(lpTokens);
  const feesPaidInETH = feesPaid.reduce(
    (s, t) => s.add(t.toToken(ETH)),
    TokenBalance.zero(ETH)
  );
  const expectedNOTEPrice = collateralPool.getExpectedETHPrice(
    noteIn,
    ethIn.toToken(ETH)
  );

  return {
    collateralBalance,
    collateralFee: feesPaidInETH,
    // Fees should already be deducted from collateralBalance
    netRealizedCollateralBalance: collateralBalance.toToken(ETH),
    postTradeBalances: [collateralBalance, ethIn.neg(), noteIn.neg()],
    depositBalance: deposit ? ethIn.toToken(deposit) : ethIn,
    expectedNOTEPrice,
  };
}

export function calculateUnstake({
  collateralPool,
  depositBalance,
}: {
  collateralPool: SNOTEWeightedPool;
  depositBalance: TokenBalance;
}) {
  const lpTokens = collateralPool.getBPTForSNOTE(depositBalance);
  const claims = collateralPool.getLPTokenClaims(lpTokens);
  const collateralBalance = claims[collateralPool.NOTE_INDEX];

  return {
    // sNOTE balance
    depositBalance,
    // NOTE balance
    collateralBalance: claims[collateralPool.NOTE_INDEX],
    // No fees paid
    collateralFee: undefined,
    netRealizedCollateralBalance: collateralBalance,
    postTradeBalances: [...claims, depositBalance.neg()],
    ethRedeem: claims[collateralPool.ETH_INDEX],
  };
}
