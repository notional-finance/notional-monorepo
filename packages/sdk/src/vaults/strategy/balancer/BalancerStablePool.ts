import { BigNumber, constants } from 'ethers';
import { BaseLiquidityPool } from '../BaseLiquidityPool';
import BalancerStableMath from './BalancerStableMath';
import FixedPoint from './FixedPoint';

interface PoolParams {
  amplificationParameter: FixedPoint;
  swapFeePercentage: FixedPoint;
}

export class BalancerStablePool extends BaseLiquidityPool<PoolParams> {
  LP_TOKEN_PRECISION = constants.WeiPerEther;

  protected getLPTokensGivenTokens(tokensIn: BigNumber[]): {
    lpTokens: BigNumber;
    feesPaid: BigNumber[];
  } {
    const balances = this.balances.map(FixedPoint.from);
    const invariant = BalancerStableMath.calculateInvariant(
      this.poolParams.amplificationParameter,
      balances,
      true
    );

    const amountsIn = tokensIn.map(FixedPoint.from);

    const feesPaid = BalancerStableMath.getDueProtocolFeeAmounts(
      this.poolParams.amplificationParameter,
      invariant,
      balances,
      this.poolParams.swapFeePercentage
    );
    const balancesWithoutFees = balances.map((b, i) => b.sub(feesPaid[i]));

    const lpTokens = BalancerStableMath.calcBptOutGivenExactTokensIn(
      this.poolParams.amplificationParameter,
      balancesWithoutFees,
      amountsIn,
      FixedPoint.from(this.totalSupply),
      this.poolParams.swapFeePercentage,
      invariant
    );

    return {
      lpTokens: lpTokens.n,
      feesPaid: feesPaid.map((f) => f.n),
    };
  }

  protected getTokensOutGivenLPTokens(
    lpTokens: BigNumber,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: BigNumber[];
    feesPaid: BigNumber[];
  } {
    if (singleSidedExitTokenIndex) {
      const balances = this.balances.map(FixedPoint.from);
      const invariant = BalancerStableMath.calculateInvariant(
        this.poolParams.amplificationParameter,
        balances,
        true
      );

      const { amountOut, feePaid } =
        BalancerStableMath.calcTokenOutGivenExactBptIn(
          this.poolParams.amplificationParameter,
          balances,
          singleSidedExitTokenIndex,
          FixedPoint.from(lpTokens),
          FixedPoint.from(this.totalSupply),
          this.poolParams.swapFeePercentage,
          invariant
        );
      const tokensOut = this.zeroTokenArray();
      const feesPaid = this.zeroTokenArray();
      tokensOut[singleSidedExitTokenIndex] = amountOut.n;
      feesPaid[singleSidedExitTokenIndex] = feePaid;
      return {
        tokensOut,
        feesPaid,
      };
    } else {
      return {
        tokensOut: this.getLPTokenClaims(lpTokens),
        feesPaid: this.zeroTokenArray(),
      };
    }
  }

  protected calculateTokenTrade(
    tokensIn: BigNumber,
    tokenIndexIn: number,
    tokenIndexOut: number
  ): {
    tokensOut: BigNumber;
    feesPaid: BigNumber[];
  } {
    const invariant = BalancerStableMath.calculateInvariant(
      this.poolParams.amplificationParameter,
      this.balances.map(FixedPoint.from),
      true
    );

    // TODO: not sure how to calculate fees paid
    const tokensOut = BalancerStableMath.calcOutGivenIn(
      this.poolParams.amplificationParameter,
      this.balances.map(FixedPoint.from),
      tokenIndexIn,
      tokenIndexOut,
      FixedPoint.from(tokensIn),
      invariant
    );

    return {
      tokensOut: tokensOut.n,
      feesPaid: [],
    };
  }
}
