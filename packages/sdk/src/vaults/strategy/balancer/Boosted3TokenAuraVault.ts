import { INTERNAL_TOKEN_PRECISION } from '../../../config/constants';
import { AggregateCall } from '../../../data/Multicall';
import TypedBigNumber from '../../../libs/TypedBigNumber';
import { LiquidationThreshold } from '../../../libs/types';
// import { Contract } from 'ethers';
// import { Boosted3TokenAura } from '../../../typechain/Boosted3TokenAura';
import VaultAccount from '../../VaultAccount';
import BalancerStableMath from './BalancerStableMath';
import {
  BaseBalancerStablePool,
  BaseBalancerStablePoolInitParams,
  PoolContext,
} from './BaseBalancerStablePool';
import FixedPoint from './FixedPoint';

// const Boosted3TokenAuraVaultABI = require('../../../abi/Boosted3TokenAuraVault.json');

interface InitParams extends BaseBalancerStablePoolInitParams {
  underlyingPoolContext: PoolContext;
  underlyingPoolScalingFactors: FixedPoint[];
  underlyingPoolAmp: FixedPoint;
  underlyingPoolFee: FixedPoint;
  underlyingTotalSupply: FixedPoint;
  basePoolContext: PoolContext;
  basePoolScalingFactors: FixedPoint[];
  basePoolAmp: FixedPoint;
  basePoolFee: FixedPoint;
  basePoolTotalSupply: FixedPoint;
}

export default class Boosted3TokenAuraVault extends BaseBalancerStablePool<InitParams> {
  public get basePoolBalances() {
    return this.initParams.basePoolContext.balances.map((b, i) =>
      b.mul(this.initParams.basePoolScalingFactors[i]).div(FixedPoint.ONE)
    );
  }

  public get underlyingPoolBalances() {
    return this.initParams.underlyingPoolContext.balances.map((b, i) =>
      b.mul(this.initParams.underlyingPoolScalingFactors[i]).div(FixedPoint.ONE)
    );
  }

  override readonly depositTuple: string =
    'tuple(uint256 minBPT, bytes tradeData) d';

  override readonly redeemTuple: string =
    'tuple(uint32 minSecondaryLendRate, uint256 minPrimary, uint256 minSecondary, bytes secondaryTradeParams) r';

  public initVaultParams() {
    // Get relevant context and set pool context
    return [] as AggregateCall[];
  }

  public getLiquidationThresholds(
    _: VaultAccount,
    __: number
  ): Array<LiquidationThreshold> {
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
    let linearPoolBPT: FixedPoint;
    {
      const { underlyingPoolAmp, underlyingPoolContext } = this.initParams;
      const balances = this.underlyingPoolBalances;
      const invariant = BalancerStableMath.calculateInvariant(
        underlyingPoolAmp,
        balances,
        true
      );
      linearPoolBPT = BalancerStableMath.calcOutGivenIn(
        underlyingPoolAmp,
        balances,
        underlyingPoolContext.primaryTokenIndex,
        underlyingPoolContext.tokenOutIndex,
        tokenAmountIn,
        invariant
      );
    }

    let boostedBPT: FixedPoint;
    {
      const { basePoolAmp, basePoolContext } = this.initParams;
      const balances = this.basePoolBalances;
      const invariant = BalancerStableMath.calculateInvariant(
        basePoolAmp,
        balances,
        true
      );
      boostedBPT = BalancerStableMath.calcOutGivenIn(
        basePoolAmp,
        balances,
        basePoolContext.primaryTokenIndex,
        basePoolContext.tokenOutIndex,
        linearPoolBPT,
        invariant
      );
    }

    return boostedBPT;
  }

  protected getUnderlyingOut(BPTIn: FixedPoint) {
    let linearPoolBPT: FixedPoint;
    {
      const { basePoolAmp, basePoolContext } = this.initParams;
      const balances = this.basePoolBalances;
      const invariant = BalancerStableMath.calculateInvariant(
        basePoolAmp,
        balances,
        true
      );
      linearPoolBPT = BalancerStableMath.calcOutGivenIn(
        basePoolAmp,
        balances,
        basePoolContext.tokenOutIndex,
        basePoolContext.primaryTokenIndex,
        BPTIn,
        invariant
      );
    }

    let underlyingTokensOut: FixedPoint;
    {
      const { underlyingPoolAmp, underlyingPoolContext } = this.initParams;
      const balances = this.underlyingPoolBalances;
      const invariant = BalancerStableMath.calculateInvariant(
        underlyingPoolAmp,
        balances,
        true
      );
      underlyingTokensOut = BalancerStableMath.calcOutGivenIn(
        underlyingPoolAmp,
        balances,
        underlyingPoolContext.tokenOutIndex,
        underlyingPoolContext.primaryTokenIndex,
        linearPoolBPT,
        invariant
      );
    }

    return TypedBigNumber.fromBalance(
      underlyingTokensOut
        .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
        .div(FixedPoint.ONE),
      this.getPrimaryBorrowSymbol(),
      true
    );
  }
}
