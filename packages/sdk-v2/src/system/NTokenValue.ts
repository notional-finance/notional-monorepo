import { BigNumber } from 'ethers';
import { System, Market, CashGroup } from '.';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { getNowSeconds, hasMatured } from '../libs/utils';
import {
  INTERNAL_TOKEN_PRECISION,
  PERCENTAGE_BASIS,
  SECONDS_IN_YEAR,
  RATE_PRECISION,
  INCENTIVE_ACCUMULATION_PRECISION,
} from '../config/constants';
import { NTokenStatus } from '../libs/types';
import { Asset } from '../data';

export default class NTokenValue {
  public static getNTokenFactors(currencyId: number) {
    const system = System.getSystem();
    const nToken = system.getNToken(currencyId);
    const totalSupply = system.getNTokenTotalSupply(currencyId);
    const nTokenPV = system.getNTokenAssetCashPV(currencyId);
    const { assetSymbol } = system.getCurrencyById(currencyId);

    if (!nToken) throw new Error(`nToken ${currencyId} not found`);
    if (!totalSupply) throw new Error(`Total nToken supply for ${currencyId} not found`);
    if (!nTokenPV) throw new Error(`Total nToken PV for ${currencyId} not found`);

    return {
      nToken,
      totalSupply,
      nTokenPV,
      assetSymbol,
    };
  }

  public static getNTokenPortfolio(currencyId: number) {
    const system = System.getSystem();
    const { cashBalance, liquidityTokens, fCash } = system.getNTokenPortfolio(currencyId);
    const cashGroup = system.getCashGroup(currencyId);

    if (!cashGroup) throw new Error(`Cash group for ${currencyId} not found`);
    if (!cashBalance || !liquidityTokens || !fCash) throw new Error(`Missing asset data for nToken at ${currencyId}`);

    return {
      cashBalance,
      liquidityTokens,
      fCash,
      cashGroup,
    };
  }

  /**
   * Converts an ntoken balance to internal asset denomination
   *
   * @param currencyId
   * @param nTokenBalance
   * @param useHaircut
   * @returns
   */
  public static convertNTokenToInternalAsset(currencyId: number, nTokenBalance: TypedBigNumber, useHaircut: boolean) {
    const { nToken, totalSupply, nTokenPV, assetSymbol } = NTokenValue.getNTokenFactors(currencyId);

    if (totalSupply.isZero()) return TypedBigNumber.from(0, BigNumberType.InternalAsset, assetSymbol);
    nTokenBalance.check(BigNumberType.nToken, nToken.nTokenSymbol);
    const nTokenHaircut = useHaircut ? nToken.pvHaircutPercentage : PERCENTAGE_BASIS;

    // Balance * PV * Haircut / (totalSupply * BASIS)
    const internalAsset = nTokenBalance.n.mul(nTokenPV.n).mul(nTokenHaircut).div(PERCENTAGE_BASIS).div(totalSupply.n);
    return TypedBigNumber.from(internalAsset, BigNumberType.InternalAsset, assetSymbol);
  }

  /**
   * Returns the amount of nTokens that will be minted as a result of deposited the amount of asset cash
   *
   * @param currencyId
   * @param assetCashAmountInternal
   * @returns
   */
  public static getNTokensToMint(currencyId: number, assetCashAmountInternal: TypedBigNumber) {
    const { nToken, totalSupply, nTokenPV, assetSymbol } = NTokenValue.getNTokenFactors(currencyId);

    assetCashAmountInternal.check(BigNumberType.InternalAsset, assetSymbol);
    const nTokenAmount = nTokenPV.isZero()
      ? assetCashAmountInternal.n
      : assetCashAmountInternal.n.mul(totalSupply.n).div(nTokenPV.n);

    return TypedBigNumber.from(nTokenAmount, BigNumberType.nToken, nToken.nTokenSymbol);
  }

  /**
   * Returns the amount of asset cash required to mint an nToken balance
   *
   * @param currencyId
   * @param nTokenBalance
   * @returns amount of asset cash required to mint the nToken balance
   */
  public static getAssetRequiredToMintNToken(currencyId: number, nTokenBalance: TypedBigNumber) {
    const { nToken, totalSupply, nTokenPV, assetSymbol } = NTokenValue.getNTokenFactors(currencyId);

    nTokenBalance.check(BigNumberType.nToken, nToken.nTokenSymbol);
    const assetCash = nTokenPV.isZero() ? nTokenBalance.n : nTokenBalance.scale(nTokenPV.n, totalSupply.n);

    return TypedBigNumber.from(assetCash, BigNumberType.InternalAsset, assetSymbol);
  }

  /**
   * Returns the amount of nTokens required to withdraw some amount of cash
   *
   * @param currencyId
   * @param assetCashAmountInternal amount of asset cash to be generated
   * @param precision amount of precision tolerance for the estimation in asset cash
   * @returns an nToken amount
   */
  public static getNTokenRedeemFromAsset(
    currencyId: number,
    assetCashAmountInternal: TypedBigNumber,
    blockTime = getNowSeconds(),
    precision = BigNumber.from(5e2)
  ) {
    const { totalSupply, nTokenPV } = NTokenValue.getNTokenFactors(currencyId);

    // The first guess is that the redeem amount is just a straight percentage of the total
    // supply, this is going to be pretty accurate is most cases
    let nTokenRedeem = totalSupply.scale(assetCashAmountInternal.n, nTokenPV.n);
    let redeemValue = NTokenValue.getAssetFromRedeemNToken(currencyId, nTokenRedeem, blockTime);
    // We always want to redeem value slightly less than the specified amount, if we were to
    // redeem slightly more then it could result in a free collateral failure. We continue to
    // loop while assetCash - redeemValue < 0 or assetCash - redeemValue > precision. Note that
    // we allow negative one as a diff due to rounding issues
    let diff = assetCashAmountInternal.sub(redeemValue);
    let totalLoops = 0;
    while (diff.n.lt(-1) || diff.n.gt(precision)) {
      // If the nToken redeem value is too high (diff < 0), we reduce the nTokenRedeem amount by
      // the proportion of the total supply. If the nToken redeem value is too low (diff > 0), increase
      // the nTokenRedeem amount by the proportion of the total supply
      const updateAmount = totalSupply.scale(diff.n, nTokenPV.n);
      // If the diff is so small it rounds down to zero when we convert to an nToken balance then
      // we can break at this point, the calculation will not converge after this
      if (updateAmount.isZero()) break;

      nTokenRedeem = nTokenRedeem.add(updateAmount);
      redeemValue = NTokenValue.getAssetFromRedeemNToken(currencyId, nTokenRedeem, blockTime);
      diff = assetCashAmountInternal.sub(redeemValue);
      totalLoops += 1;
      if (totalLoops > 50) throw Error('Unable to converge on nTokenRedeem');
    }

    return nTokenRedeem;
  }

  public static getNTokenStatus(currencyId: number) {
    if (!System.getSystem().getNToken(currencyId)) return NTokenStatus.NoNToken;
    const { liquidityTokens, fCash } = NTokenValue.getNTokenPortfolio(currencyId);

    // If there are no liquidity tokens then the markets have not been initialized for the first time,
    // but mint and redeem are still possible.
    if (liquidityTokens.length > 0 && hasMatured(liquidityTokens[0])) return NTokenStatus.MarketsNotInitialized;
    if (fCash.filter((f) => !liquidityTokens.find((lt) => lt.maturity === f.maturity)).length) {
      // If residual fCash is in the nToken account this calculation will not work. nTokens can still
      // be redeemed but will have residual fCash assets.
      return NTokenStatus.nTokenHasResidual;
    }

    return NTokenStatus.Ok;
  }

  /**
   * Returns the amount of asset cash the account will receive from redeeming nTokens
   *
   * @param currencyId
   * @param nTokenBalance amount of nTokens to redeem
   * @returns a TypedBigNumber in internal asset denomination
   */
  public static getAssetFromRedeemNToken(
    currencyId: number,
    nTokenBalance: TypedBigNumber,
    blockTime = getNowSeconds()
  ) {
    const { nToken, totalSupply } = NTokenValue.getNTokenFactors(currencyId);
    const { cashBalance, liquidityTokens, fCash, cashGroup } = NTokenValue.getNTokenPortfolio(currencyId);
    nTokenBalance.check(BigNumberType.nToken, nToken.nTokenSymbol);

    const status = NTokenValue.getNTokenStatus(currencyId);
    if (status === NTokenStatus.MarketsNotInitialized) throw Error(status);

    // This is the redeemer's share of the cash balance
    const cashBalanceShare = cashBalance.scale(nTokenBalance.n, totalSupply.n);
    const liquidityTokensToWithdraw = NTokenValue.getTokensToWithdraw(
      currencyId,
      status,
      nTokenBalance,
      cashGroup,
      liquidityTokens,
      fCash,
      totalSupply
    );

    return liquidityTokensToWithdraw.reduce((totalAssetCash, lt) => {
      // Inside this reduce we simulate what the redeemer will receive for withdrawing the specified
      // amount of liquidity tokens
      const { fCashClaim, assetCashClaim } = cashGroup.getLiquidityTokenValue(lt.assetType, lt.notional, false);
      // This is the redeemer's share of the fCash position
      const fCashPosition = fCash.find((f) => f.maturity === lt.maturity)?.notional || fCashClaim.copy(0);

      let fCashShare: TypedBigNumber;
      if (status === NTokenStatus.Ok) {
        // In normal conditions, the fCash share is proportional to the total supply
        fCashShare = fCashPosition.scale(nTokenBalance.n, totalSupply.n);
      } else {
        // In ifCash conditions, the fCash share is proportional to the liquidity tokens removed
        const totalLiquidityTokens = liquidityTokens.find((l) => l.maturity === lt.maturity)!.notional;
        fCashShare = fCashPosition.scale(lt.notional.n, totalLiquidityTokens.n);
      }

      // Redeemer's netfCash position
      const netfCashShare = fCashShare.add(fCashClaim);

      if (!netfCashShare.isZero()) {
        // Simulates cash generated by trading off the fCash position
        const market = cashGroup.getMarket(CashGroup.getMarketIndexForMaturity(lt.maturity));
        const { netCashToAccount } = market.getCashAmountGivenfCashAmount(netfCashShare.neg(), blockTime);
        const netAssetCashShare = netCashToAccount.toAssetCash();
        return totalAssetCash.add(assetCashClaim).add(netAssetCashShare);
      }
      return totalAssetCash.add(assetCashClaim);
    }, cashBalanceShare);
  }

  /**
   * Mirrors the calculation done in the smart contract to get the nTokens to withdraw
   */
  private static getTokensToWithdraw(
    currencyId: number,
    status: NTokenStatus,
    nTokenBalance: TypedBigNumber,
    cashGroup: CashGroup,
    liquidityTokens: readonly Asset[],
    fCash: readonly Asset[],
    totalSupply: TypedBigNumber
  ): Asset[] {
    const currency = System.getSystem().getCurrencyById(currencyId);

    if (status === NTokenStatus.Ok) {
      // If there are no residuals, we return the proportional share
      return liquidityTokens.map((lt) => ({ ...lt, notional: lt.notional.scale(nTokenBalance.n, totalSupply.n) }));
    }
    const totalAssetValueInMarkets = liquidityTokens.reduce((total, lt) => {
      const { fCashClaim, assetCashClaim } = cashGroup.getLiquidityTokenValue(lt.assetType, lt.notional, false);
      const fCashPosition = fCash.find((f) => f.maturity === lt.maturity)?.notional || fCashClaim.copy(0);
      const netfCash = fCashPosition.add(fCashClaim);
      return total
        .add(assetCashClaim)
        .add(cashGroup.getfCashPresentValueUnderlyingInternal(lt.maturity, netfCash, false).toAssetCash());
    }, TypedBigNumber.from(0, BigNumberType.InternalAsset, currency.assetSymbol));

    const ifCashRiskAdjustedValue = fCash
      .filter((f) => CashGroup.isIdiosyncratic(f.maturity))
      .reduce(
        (total, f) =>
          total.add(cashGroup.getfCashPresentValueUnderlyingInternal(f.maturity, f.notional, true).toAssetCash()),
        TypedBigNumber.from(0, BigNumberType.InternalAsset, currency.assetSymbol)
      );

    const totalPortfolioValue = totalAssetValueInMarkets.add(ifCashRiskAdjustedValue);

    return liquidityTokens.map((lt) => {
      const tokensToWithdraw = lt.notional.n
        .mul(nTokenBalance.n)
        .mul(totalPortfolioValue.n)
        .div(totalAssetValueInMarkets.n)
        .div(totalSupply.n);

      return { ...lt, notional: lt.notional.copy(tokensToWithdraw) };
    });
  }

  /**
   * Returns the blended interest rate for an nToken as described here:
   * https://app.gitbook.com/@notional-finance/s/notional-v2/technical-topics/ntoken-blended-interest-rate
   *
   * @param currencyId
   * @returns a number that represents the blended annual interest rate
   */
  public static getNTokenBlendedYield(currencyId: number) {
    const { cashBalance, liquidityTokens, fCash, cashGroup } = NTokenValue.getNTokenPortfolio(currencyId);

    return NTokenValue.calculateNTokenBlendedYieldAtBlock(currencyId, cashBalance, liquidityTokens, fCash, cashGroup);
  }

  protected static calculateNTokenBlendedYieldAtBlock(
    currencyId: number,
    cashBalance: TypedBigNumber,
    liquidityTokens: readonly Asset[],
    fCash: readonly Asset[],
    cashGroup: CashGroup,
    blockTime = getNowSeconds(),
    marketOverrides?: Market[],
    assetRateOverride?: BigNumber
  ) {
    let totalAssetCash = cashBalance;
    const supplyRate = cashGroup.blockSupplyRate;
    // Check null or undefined because zero is valid supply rate
    if (supplyRate === null || supplyRate === undefined) throw new Error(`Supply rate for ${currencyId} not found`);

    const fCashInterestRates = fCash.map((f) => {
      let { notional: fCashNotional } = f;

      // Get the total asset cash and the netfCash notional from the liquidity tokens
      liquidityTokens
        .filter((l) => l.maturity === f.maturity)
        .forEach((lt, index) => {
          if (index > 0) throw Error('Found multiple liquidity tokens for single maturity');

          const { fCashClaim, assetCashClaim } = cashGroup.getLiquidityTokenValue(lt.assetType, lt.notional, false);
          totalAssetCash = totalAssetCash.add(assetCashClaim);
          fCashNotional = fCashNotional.add(fCashClaim);
        });

      // The blended interest rate will be weighted average of the interest rates and their associated present values
      return {
        rate: cashGroup.getOracleRate(f.maturity, blockTime, marketOverrides, supplyRate),
        weight: cashGroup.getfCashPresentValueUnderlyingInternal(
          f.maturity,
          fCashNotional,
          false,
          blockTime,
          marketOverrides,
          supplyRate
        ),
      };
    });

    const totalCashUnderlying = totalAssetCash.toUnderlying(true, assetRateOverride);
    // The denominator is the total amount of underlying that the nToken account holds
    const totalUnderlying = fCashInterestRates.reduce((t, { weight }) => t.add(weight), totalCashUnderlying);
    // The numerator is the present value multiplied by its associated interest rate
    const numerator = fCashInterestRates.reduce(
      (num, { rate, weight }) => num.add(weight.scale(rate, 1)),
      totalCashUnderlying.scale(supplyRate, 1)
    );

    return totalUnderlying.isZero() ? 0 : numerator.n.div(totalUnderlying.n).toNumber();
  }

  public static getNTokenIncentiveYield(currencyId: number) {
    const { nToken, nTokenPV } = NTokenValue.getNTokenFactors(currencyId);
    const annualIncentivesLocalValue = TypedBigNumber.fromBalance(nToken.incentiveEmissionRate, 'NOTE', true)
      .toETH(false)
      .fromETH(currencyId, false);

    return (
      annualIncentivesLocalValue
        .scale(INTERNAL_TOKEN_PRECISION, nTokenPV.toUnderlying().n)
        // Convert this to 1e9 rate precision for consistency
        .scale(RATE_PRECISION, INTERNAL_TOKEN_PRECISION)
        .toNumber()
    );
  }

  /**
   * Returns the claimable incentives for a single nToken balance
   *
   * @param currencyId currency id of the nToken
   * @param nTokenBalance balance of nToken prior to any minting or redeeming
   * @param _lastClaimTime
   * @param _accountIncentiveDebt this parameter is overwritten last claim integral supply
   * @returns
   */
  public static getClaimableIncentives(
    currencyId: number,
    nTokenBalance: TypedBigNumber,
    _lastClaimTime: BigNumber,
    _accountIncentiveDebt: BigNumber,
    blockTime = getNowSeconds()
  ): TypedBigNumber {
    // This will get rewritten in the case of migration so don't reassign to the parameter
    let accountIncentiveDebt = BigNumber.from(_accountIncentiveDebt);
    const { nToken, totalSupply } = NTokenValue.getNTokenFactors(currencyId);
    const incentiveFactors = System.getSystem().getNTokenIncentiveFactors(currencyId);
    if (!incentiveFactors) throw new Error('Incentive emission factors not found');
    nTokenBalance.check(BigNumberType.nToken, nToken.nTokenSymbol);
    let incentives = BigNumber.from(0);
    const migrationFactors = System.getSystem().getIncentiveMigration(currencyId);
    const lastClaimTime = _lastClaimTime.toNumber();

    if (lastClaimTime > 0 && migrationFactors && lastClaimTime <= migrationFactors.migrationTime) {
      // nToken requires migration calculations
      const timeSinceMigration = migrationFactors.migrationTime - lastClaimTime;

      if (timeSinceMigration > 0) {
        const incentiveRate = migrationFactors.migratedEmissionRate
          .mul(INTERNAL_TOKEN_PRECISION)
          .mul(timeSinceMigration)
          .div(SECONDS_IN_YEAR);

        /// incentivesToClaim = (tokenBalance / totalSupply) * emissionRatePerYear * proRataYears
        ///   where proRataYears is (timeSinceLastClaim / YEAR) * INTERNAL_TOKEN_PRECISION
        const avgTotalSupply = migrationFactors.integralTotalSupply
          .sub(accountIncentiveDebt) // accountIncentiveDebt here is actually the lastClaimIntegralSupply
          .div(timeSinceMigration);
        if (avgTotalSupply.isZero()) return TypedBigNumber.from(0, BigNumberType.NOTE, 'NOTE');

        incentives = incentives.add(nTokenBalance.n.mul(incentiveRate).div(avgTotalSupply));
      }
      // Set this to zero to mark the migration
      accountIncentiveDebt = BigNumber.from(0);
    }

    // Update the stored accumulatedNOTEPerNToken to present time
    const timeSinceLastAccumulation = BigNumber.from(blockTime).sub(incentiveFactors.lastAccumulatedTime);
    if (timeSinceLastAccumulation.lt(0)) throw Error('Invalid accumulation time');

    const accumulatedNOTEPerNToken = incentiveFactors.accumulatedNOTEPerNToken.add(
      timeSinceLastAccumulation
        .mul(INCENTIVE_ACCUMULATION_PRECISION)
        .mul(nToken.incentiveEmissionRate)
        .div(SECONDS_IN_YEAR)
        .div(totalSupply.n)
    );

    // This is the post migration incentive calculation
    incentives = incentives.add(
      nTokenBalance.n.mul(accumulatedNOTEPerNToken).div(INCENTIVE_ACCUMULATION_PRECISION).sub(accountIncentiveDebt)
    );

    return TypedBigNumber.from(incentives, BigNumberType.NOTE, 'NOTE');
  }
}
