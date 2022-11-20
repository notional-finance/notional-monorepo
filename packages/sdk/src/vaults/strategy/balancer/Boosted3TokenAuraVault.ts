import { BigNumber } from 'ethers';
import {
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
} from '../../../config/constants';
import { AggregateCall } from '../../../data/Multicall';
import TypedBigNumber from '../../../libs/TypedBigNumber';
import { LiquidationThreshold } from '../../../libs/types';
import BalancerLinearMath, { BalancerLinearParams } from './BalancerLinearMath';
import BalancerStableMath from './BalancerStableMath';
import {
  BaseBalancerStablePool,
  BaseBalancerStablePoolInitParams,
  PoolContext,
} from './BaseBalancerStablePool';
import FixedPoint from './FixedPoint';

export interface LinearPoolContext {
  mainTokenIndex: number;
  wrappedTokenIndex: number;
  balances: FixedPoint[];
}

export interface BoostedPoolContext extends PoolContext {
  secondaryTokenIndex: number;
  tertiaryTokenIndex: number;
}

interface InitParams extends BaseBalancerStablePoolInitParams {
  underlyingPoolContext: LinearPoolContext;
  underlyingPoolScalingFactors: FixedPoint[];
  underlyingPoolTotalSupply: FixedPoint;
  underlyingPoolParams: BalancerLinearParams;
  basePoolContext: BoostedPoolContext;
  basePoolScalingFactors: FixedPoint[];
  basePoolAmp: FixedPoint;
  basePoolFee: FixedPoint;
  basePoolTotalSupply: FixedPoint;
}

export default class Boosted3TokenAuraVault extends BaseBalancerStablePool<InitParams> {
  public get basePoolBalances() {
    const context = this.initParams.basePoolContext;
    const { balances } = context;
    const scalingFactors = this.initParams.basePoolScalingFactors;

    return [
      balances[context.primaryTokenIndex]
        .mul(scalingFactors[context.primaryTokenIndex])
        .div(FixedPoint.ONE),
      balances[context.secondaryTokenIndex]
        .mul(scalingFactors[context.secondaryTokenIndex])
        .div(FixedPoint.ONE),
      balances[context.tertiaryTokenIndex]
        .mul(scalingFactors[context.tertiaryTokenIndex])
        .div(FixedPoint.ONE),
    ];
  }

  public get underlyingPoolBalances() {
    const context = this.initParams.underlyingPoolContext;
    const { balances } = context;
    const scalingFactors = this.initParams.underlyingPoolScalingFactors;

    return [
      balances[context.mainTokenIndex]
        .mul(scalingFactors[context.mainTokenIndex])
        .div(FixedPoint.ONE),
      balances[context.wrappedTokenIndex]
        .mul(scalingFactors[context.wrappedTokenIndex])
        .div(FixedPoint.ONE),
    ];
  }

  override readonly depositTuple: string =
    'tuple(uint256 minBPT, bytes tradeData) d';

  override readonly redeemTuple: string =
    'tuple(uint32 minSecondaryLendRate, uint256 minPrimary, uint256 minSecondary, bytes secondaryTradeParams) r';

  public initVaultParams() {
    // Get relevant context and set pool context
    return [] as AggregateCall[];
  }

  public getLiquidationThresholds(): Array<LiquidationThreshold> {
    return [];
  }

  protected getBPTValue(amountIn: FixedPoint = FixedPoint.ONE) {
    // Valuation is done on the base pool since this is the token the vault holds
    const { basePoolAmp, basePoolContext, basePoolTotalSupply } =
      this.initParams;
    const { primaryTokenIndex } = basePoolContext;
    const balances = this.basePoolBalances;
    const invariant = BalancerStableMath.calculateInvariant(
      basePoolAmp,
      balances,
      true
    );

    return BalancerStableMath.calcTokenOutGivenExactBptIn(
      basePoolAmp,
      balances,
      primaryTokenIndex,
      amountIn,
      basePoolTotalSupply,
      FixedPoint.from(0), // swap fee percentage set to zero
      invariant
    );
  }

  protected getBPTOut(tokenAmountIn: FixedPoint) {
    let linearBPT: FixedPoint;
    {
      const balances = this.underlyingPoolBalances;
      const context = this.initParams.underlyingPoolContext;
      const {
        underlyingPoolTotalSupply,
        underlyingPoolParams,
        underlyingPoolScalingFactors,
      } = this.initParams;
      const amountIn = tokenAmountIn
        .mul(underlyingPoolScalingFactors[context.mainTokenIndex])
        .div(FixedPoint.ONE);
      linearBPT = BalancerLinearMath.calcBptOutPerMainIn(
        amountIn,
        balances[0],
        balances[1],
        underlyingPoolTotalSupply,
        underlyingPoolParams
      );
    }

    let boostedBPT: FixedPoint;
    {
      const {
        basePoolAmp,
        basePoolTotalSupply,
        basePoolScalingFactors,
        basePoolFee,
      } = this.initParams;
      const context = this.initParams.basePoolContext;
      const balances = this.basePoolBalances;
      const invariant = BalancerStableMath.calculateInvariant(
        basePoolAmp,
        balances,
        true
      );
      const feeAmount = linearBPT.mulUp(basePoolFee);
      const amountIn = linearBPT
        .sub(feeAmount)
        .mul(basePoolScalingFactors[context.primaryTokenIndex])
        .div(FixedPoint.ONE);
      boostedBPT = BalancerStableMath.calcBptOutGivenExactTokensIn(
        basePoolAmp,
        balances,
        // basePoolBalances() rearranges the balances so that primary is always in the
        // zero index spot
        [amountIn, FixedPoint.from(0), FixedPoint.from(0)],
        basePoolTotalSupply,
        FixedPoint.from(0),
        invariant
      );
    }

    return boostedBPT;
  }

  protected getUnderlyingOut(BPTIn: FixedPoint) {
    let linearBPT: FixedPoint;
    {
      const {
        basePoolAmp,
        basePoolTotalSupply,
        basePoolScalingFactors,
        basePoolFee,
      } = this.initParams;
      const context = this.initParams.basePoolContext;
      const balances = this.basePoolBalances;
      const invariant = BalancerStableMath.calculateInvariant(
        basePoolAmp,
        balances,
        true
      );
      const amountOut = BalancerStableMath.calcTokenOutGivenExactBptIn(
        basePoolAmp,
        balances,
        // basePoolBalances() rearranges the balances so that primary is always in the
        // zero index spot
        0,
        BPTIn,
        basePoolTotalSupply,
        FixedPoint.from(0),
        invariant
      );
      const feeAmount = amountOut.mulUp(basePoolFee);
      // Scale amountOut
      linearBPT = amountOut
        .sub(feeAmount)
        .mul(FixedPoint.ONE)
        .div(basePoolScalingFactors[context.primaryTokenIndex]);
    }

    let underlyingTokensOut: FixedPoint;
    {
      const balances = this.underlyingPoolBalances;
      const context = this.initParams.underlyingPoolContext;
      const {
        underlyingPoolTotalSupply,
        underlyingPoolParams,
        underlyingPoolScalingFactors,
      } = this.initParams;
      const amountOut = BalancerLinearMath.calcMainOutPerBptIn(
        linearBPT,
        balances[0],
        balances[1],
        underlyingPoolTotalSupply,
        underlyingPoolParams
      );
      // Scale amountOut
      underlyingTokensOut = amountOut
        .mul(FixedPoint.ONE)
        .div(underlyingPoolScalingFactors[context.mainTokenIndex]);
    }

    return TypedBigNumber.fromBalance(
      underlyingTokensOut
        .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
        .div(FixedPoint.ONE).n,
      this.getPrimaryBorrowSymbol(),
      true
    );
  }

  public async getRedeemParametersExact(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number
  ) {
    const { amountRedeemed } = this.getRedeemGivenStrategyTokens(
      maturity,
      strategyTokens
    );
    return {
      minPrimary: amountRedeemed
        .toExternalPrecision()
        .scale(RATE_PRECISION - slippageBuffer, RATE_PRECISION).n,
      minSecondary: BigNumber.from(0),
      secondaryTradeParams: '0x',
    };
  }
}
