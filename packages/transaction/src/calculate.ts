import {
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
  RATE_DECIMALS,
  RATE_PRECISION,
} from '@notional-finance/util';

/**
 * Calculates vault debt and collateral given a risk limit
 */
export function calculateVaultDebtCollateralGivenDepositRiskLimit({
  collateral,
  debt,
  vaultAdapter,
  depositBalance,
  balances,
  riskFactorLimit,
  vaultLastUpdateTime,
  maxCollateralSlippage,
}: {
  collateral: TokenDefinition;
  debt: TokenDefinition;
  vaultAdapter: VaultAdapter;
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
    balances || [TokenBalance.zero(collateral), TokenBalance.zero(debt)],
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

    if (limitInRP === 0) {
      // In this case, nothing is being borrowed so just return the collateral balances
      return {
        ...calculateVaultCollateral({
          collateral,
          vaultAdapter,
          debtBalance: TokenBalance.zero(debt),
          depositBalance,
        }),
        debtBalance: TokenBalance.zero(debt),
      };
    }

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

    if (initialDebtUnitsEstimateInRP === 0) {
      return {
        ...calculateVaultCollateral({
          collateral,
          vaultAdapter,
          debtBalance: TokenBalance.zero(debt),
          depositBalance,
        }),
        debtBalance: TokenBalance.zero(debt),
      };
    }

    ({ netVaultSharesForUnderlying: netVaultSharesForWithdraw } =
      vaultAdapter.getNetVaultSharesMinted(depositBalance, collateral));
    profile = profile.simulate([netVaultSharesForWithdraw]);
  } else if (!profile.vaultDebt.isZero()) {
    initialDebtUnitsEstimateInRP = Math.floor(
      (profile.vaultDebt.toFloat() * RATE_PRECISION) / 2
    );
  }

  const results = profile.getDebtAndCollateralMaintainRiskFactor(
    debt,
    riskFactorLimit,
    (debtBalance: TokenBalance) => {
      return calculateVaultCollateral({
        collateral,
        vaultAdapter,
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

  // NOTE: this will throw if the market cannot support the utilization
  const market = getNetworkModel(
    collateral.network
  ).getLendingMarketFromVaultDebt(debt);
  market.getInterestRate(market.getUtilization(undefined, results.debtBalance));

  return {
    ...results,
    collateralBalance,
  };
}

export function calculateVaultRoll({
  debt,
  balances,
  vaultLastUpdateTime,
}: {
  debt: TokenDefinition;
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

  const costToRepay = currentDebt.neg().toUnderlying();
  const newVaultShares = TokenBalance.from(
    collateralBalance.n,
    model.getVaultShare(debt.vaultAddress)
  );

  return {
    netRealizedDebtBalance: costToRepay,
    debtBalance: costToRepay.toToken(debt),
    // This is the cost to exit the fixed debt
    debtFee: costToRepay.copy(0),
    collateralFee: costToRepay.copy(0),
    netRealizedCollateralBalance: newVaultShares.toUnderlying(),
    collateralBalance: newVaultShares,
  };
}

function calculateVaultCollateral({
  collateral,
  vaultAdapter,
  depositBalance,
  debtBalance,
}: {
  collateral: TokenDefinition;
  vaultAdapter: VaultAdapter;
  debtBalance: TokenBalance;
  depositBalance?: TokenBalance;
}) {
  if (debtBalance.tokenType !== 'VaultDebt') throw Error('Invalid inputs');
  const underlyingBorrowed = debtBalance.neg().toUnderlying();
  const netRealizedCollateralBalance = depositBalance
    ? underlyingBorrowed.add(depositBalance)
    : underlyingBorrowed;

  // This value accounts for slippage...
  const { netVaultSharesForUnderlying, feesPaid, vaultTradeMetadata } =
    vaultAdapter.getNetVaultSharesMinted(
      netRealizedCollateralBalance,
      collateral
    );

  return {
    collateralBalance: netVaultSharesForUnderlying,
    debtFee: netRealizedCollateralBalance.copy(0),
    collateralFee: feesPaid,
    netRealizedCollateralBalance: debtBalance.isNegative()
      ? netRealizedCollateralBalance.sub(feesPaid.toUnderlying())
      : netRealizedCollateralBalance.add(feesPaid.toUnderlying()),
    netRealizedDebtBalance: underlyingBorrowed.neg(),
    vaultTradeMetadata,
  };
}

export function calculateWithdraw({
  collateral,
  vaultAdapter,
  debt,
  balances,
  vaultLastUpdateTime,
}: {
  collateral: TokenDefinition;
  vaultAdapter: VaultAdapter;
  debt: TokenDefinition;
  balances: TokenBalance[];
  vaultLastUpdateTime: number;
}) {
  const vaultAddress = collateral.vaultAddress;
  if (!vaultAddress) throw Error('Vault Address not defined');
  const profile = new VaultAccountRiskProfile(
    vaultAddress,
    balances || [TokenBalance.zero(collateral), TokenBalance.zero(debt)],
    vaultLastUpdateTime || 0
  );

  // This is the amount of yield tokens that will be put into the withdraw queue
  const withdrawAmount = profile.vaultShares.toToken(vaultAdapter.yieldToken);

  return {
    collateralBalance: profile.vaultShares.neg(),
    collateralFee: TokenBalance.zero(withdrawAmount.token),
    debtBalance: profile.vaultDebt,
    netRealizedCollateralBalance: withdrawAmount,
    // These two are just used to satisfy the type system, not used in the UI
    netRealizedDebtBalance: TokenBalance.zero(debt),
    debtFee: TokenBalance.zero(debt),
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
