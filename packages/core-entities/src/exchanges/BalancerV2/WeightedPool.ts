import { BalancerPoolABI } from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../..';
import BaseLiquidityPool from '../BaseLiquidityPool';
import { getCommonBalancerAggregateCall } from './Common';
import FixedPoint from './FixedPoint';

interface PoolParams {
  normalizedWeights: FixedPoint[];
  swapFeePercentage: FixedPoint;
}

// Adapted From: https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/pool-weighted/contracts/WeightedMath.sol
export default class WeightedPool extends BaseLiquidityPool<PoolParams> {
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, BalancerPoolABI);
    const commonCalls = getCommonBalancerAggregateCall(
      network,
      poolAddress,
      pool
    );

    return commonCalls.concat({
      stage: 0,
      target: pool,
      method: 'getNormalizedWeights',
      key: 'normalizedWeights',
      transform: (r: BigNumber[]) => r.map(FixedPoint.from),
    });
  }

  public getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    // All math is done in 18 decimal places
    const balances = this.balances.map((b) => FixedPoint.from(b.scaleTo(18)));
    const scaledTokensIn = tokensIn.map((t) => FixedPoint.from(t.scaleTo(18)));

    // This ratio calculates how much the pool balance will change on a normalized basis.
    // ratio = (balance + amount) / balance in 18 decimals
    const balanceRatiosWithFees = scaledTokensIn.map((t, i) =>
      t.add(balances[i]).divDown(balances[i])
    );

    // The invariant ratio with fees calculates the normalized change to the invariant given the
    // two deposit amounts. The invariant ratio is: product(ethRatio ^ weight), this
    // formula calculates the log of those two figures:
    // log(invariant) = 0.2 * log(ethRatio) + 0.8 * log(noteRatio)
    const invariantRatioWithFees = balanceRatiosWithFees.reduce(
      (sum, ratio, i) =>
        sum.add(ratio.mulDown(this.poolParams.normalizedWeights[i])),
      FixedPoint.from(0)
    );

    const amountInMinusFee = scaledTokensIn.map((t, i) => {
      if (balanceRatiosWithFees[i].gt(invariantRatioWithFees)) {
        // If depositing when balanceRatioWithFee > 1 the invariant will move away
        // from it's target position (invariantRatioWithFees == 1) then we need to apply
        // a swap fee to the ethAmount.
        const nonTaxableAmount = balances[i].mulDown(
          invariantRatioWithFees.sub(FixedPoint.ONE)
        );
        const taxableAmount = t.sub(nonTaxableAmount);
        return nonTaxableAmount.add(
          taxableAmount.mulDown(
            FixedPoint.ONE.sub(this.poolParams.swapFeePercentage)
          )
        );
      } else {
        // No fee applied
        return t;
      }
    });

    const invariantRatio = amountInMinusFee.reduce((invRatio, a, i) => {
      const balanceRatio = a.add(balances[i]).divDown(balances[i]);
      return invRatio.mulDown(
        balanceRatio.powDown(this.poolParams.normalizedWeights[i])
      );
    }, FixedPoint.from(FixedPoint.ONE.n));

    if (invariantRatio.gt(FixedPoint.ONE)) {
      const feesPaid = tokensIn.map((t, i) =>
        t.sub(
          // Convert to token decimals and subtract to get the fee paid
          amountInMinusFee[i].mulDown(FixedPoint.from(t.precision)).convertTo(t)
        )
      );
      const lpTokens = this.totalSupply.scale(
        invariantRatio.sub(FixedPoint.ONE).n,
        FixedPoint.ONE.n
      );

      return { lpTokens, feesPaid };
    }

    throw Error('Insufficient liquidity');
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    if (singleSidedExitTokenIndex) {
      const exitBalance = this.balances[singleSidedExitTokenIndex];
      const scaledBalance = FixedPoint.from(exitBalance.scaleTo(18));
      const normalizedWeight =
        this.poolParams.normalizedWeights[singleSidedExitTokenIndex];

      const totalSupply = FixedPoint.from(this.totalSupply.n);
      const bptAmountIn = FixedPoint.from(lpTokens.n);
      const invariantRatio = totalSupply.sub(bptAmountIn).divUp(totalSupply);

      const balanceRatio = invariantRatio.powUp(
        FixedPoint.ONE.divDown(normalizedWeight)
      );
      const amountOutWithoutFee = scaledBalance.mulDown(
        balanceRatio.complement()
      );

      // Portion of the amount out that fees will apply to
      const taxableAmount = amountOutWithoutFee.mulUp(
        normalizedWeight.complement()
      );

      // Portion of the amount out not subject to fees
      const nonTaxableAmount = amountOutWithoutFee.sub(taxableAmount);
      const taxableAmountMinusFees = taxableAmount.mulUp(
        this.poolParams.swapFeePercentage.complement()
      );

      const tokensOut = this.zeroTokenArray();
      const feesPaid = this.zeroTokenArray();

      const tokensOutScaled = nonTaxableAmount
        .add(taxableAmountMinusFees)
        .mulDown(FixedPoint.from(exitBalance.precision));

      tokensOut[singleSidedExitTokenIndex] =
        tokensOutScaled.convertTo(exitBalance);

      feesPaid[singleSidedExitTokenIndex] = amountOutWithoutFee
        .sub(tokensOutScaled)
        .mulDown(FixedPoint.from(exitBalance.precision))
        .convertTo(exitBalance);

      return { tokensOut, feesPaid };
    } else {
      return {
        tokensOut: this.getLPTokenClaims(lpTokens),
        feesPaid: this.zeroTokenArray(),
      };
    }
  }

  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexIn: number,
    tokenIndexOut: number,
    balanceOverrides?: TokenBalance[]
  ) {
    const balanceIn = FixedPoint.from(
      (balanceOverrides || this.balances)[tokenIndexIn].scaleTo(18)
    );
    const balanceOut = FixedPoint.from(
      (balanceOverrides || this.balances)[tokenIndexOut].scaleTo(18)
    );
    const amountIn = FixedPoint.from(tokensIn.scaleTo(18));
    const normalizedWeightIn = this.poolParams.normalizedWeights[tokenIndexIn];
    const normalizedWeightOut =
      this.poolParams.normalizedWeights[tokenIndexOut];

    const denominator = balanceIn.add(amountIn);
    const base = balanceIn.divUp(denominator);
    const exponent = normalizedWeightIn.divDown(normalizedWeightOut);
    const power = base.powUp(exponent);

    const feesPaid = this.zeroTokenArray();
    const tokensOut = balanceOut
      .mulDown(power.complement())
      .mulDown(FixedPoint.from(this.balances[tokenIndexOut].precision))
      .convertTo(this.balances[tokenIndexOut]);

    return { tokensOut, feesPaid };
  }
}
