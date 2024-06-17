import { BalancerPoolABI } from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../..';
import BaseLiquidityPool from '../base-liquidity-pool';
import { getCommonBalancerAggregateCall } from './common-calls';
import FixedPoint from './fixed-point';

export interface PoolParams {
  normalizedWeights: FixedPoint[];
  scalingFactors: FixedPoint[];
  swapFeePercentage: FixedPoint;
  lastPostJoinExitInvariant?: FixedPoint;
}

// Adapted From: https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/pool-weighted/contracts/WeightedMath.sol
export default class WeightedPool<
  T extends PoolParams
> extends BaseLiquidityPool<T> {
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

    return commonCalls.concat(
      {
        stage: 0,
        target: pool,
        method: 'getNormalizedWeights',
        key: 'normalizedWeights',
        transform: (r: BigNumber[]) => r.map(FixedPoint.from),
      },
      {
        stage: 0,
        target: pool,
        method: 'getScalingFactors',
        key: 'scalingFactors',
        transform: (r: BigNumber[]) => r.map(FixedPoint.from),
      },
      {
        stage: 0,
        target: pool,
        method: 'getLastPostJoinExitInvariant',
        key: 'lastPostJoinExitInvariant',
        transform: (r: BigNumber) => FixedPoint.from(r),
      }
    );
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
          amountInMinusFee[i].convertTo(t, this.poolParams.scalingFactors[i])
        )
      );
      const lpTokens = this.totalSupply.scale(
        invariantRatio.sub(FixedPoint.ONE).n,
        FixedPoint.ONE.n
      );

      const lpClaims = this.getLPTokenClaims(
        lpTokens,
        this.balances.map((b, i) => b.add(tokensIn[i])),
        this.totalSupply.add(lpTokens)
      );

      return { lpTokens, feesPaid, lpClaims };
    }

    throw Error('Insufficient liquidity');
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    if (singleSidedExitTokenIndex !== undefined) {
      // NOTE: this is only on newer weighted pools that pay fees this way
      const bptProtocolFees = this._getPreJoinExitProtocolFees();

      const exitBalance = this.balances[singleSidedExitTokenIndex];
      const scaledBalance = FixedPoint.from(exitBalance.scaleTo(18));
      const normalizedWeight =
        this.poolParams.normalizedWeights[singleSidedExitTokenIndex];

      const totalSupplyWithFees = FixedPoint.convert(
        this.totalSupply.add(bptProtocolFees)
      );
      const bptAmountIn = FixedPoint.convert(lpTokens);
      const invariantRatio = totalSupplyWithFees
        .sub(bptAmountIn)
        .divUp(totalSupplyWithFees);

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

      const tokensOutScaled = nonTaxableAmount.add(taxableAmountMinusFees);

      tokensOut[singleSidedExitTokenIndex] = tokensOutScaled.convertTo(
        exitBalance,
        this.poolParams.scalingFactors[singleSidedExitTokenIndex]
      );

      feesPaid[singleSidedExitTokenIndex] = amountOutWithoutFee
        .sub(tokensOutScaled)
        .convertTo(
          exitBalance,
          this.poolParams.scalingFactors[singleSidedExitTokenIndex]
        );

      // NOTE: there is another fee paid on _afterJoinExit which mints more BPT but does not affect
      // our calculation here
      return { tokensOut, feesPaid };
    } else {
      return {
        tokensOut: this.getLPTokenClaims(lpTokens),
        feesPaid: this.zeroTokenArray(),
      };
    }
  }

  // https://github.com/balancer/balancer-v2-monorepo/blob/c7d4abbea39834e7778f9ff7999aaceb4e8aa048/pkg/pool-weighted/contracts/WeightedMath.sol#L76-L109
  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    balanceOverrides?: TokenBalance[]
  ) {
    const tokenIndexIn = this.getTokenIndex(tokensIn.token);
    const balanceIn = FixedPoint.from(
      (balanceOverrides || this.balances)[tokenIndexIn].scaleTo(18)
    );
    const balanceOut = FixedPoint.from(
      (balanceOverrides || this.balances)[tokenIndexOut].scaleTo(18)
    );

    // Swap fees are subtracted prior to scaling
    const { tokensInMinusFees, feePaid } =
      this._subtractSwapFeeAmount(tokensIn);
    const normalizedWeightIn = this.poolParams.normalizedWeights[tokenIndexIn];
    const normalizedWeightOut =
      this.poolParams.normalizedWeights[tokenIndexOut];

    const denominator = balanceIn.add(
      FixedPoint.convert(tokensInMinusFees).mulDown(
        this.poolParams.scalingFactors[tokenIndexIn]
      )
    );
    const base = balanceIn.divUp(denominator);
    const exponent = normalizedWeightIn.divDown(normalizedWeightOut);
    const power = base.powUp(exponent);

    const feesPaid = this.zeroTokenArray();
    feesPaid[tokenIndexIn] = feePaid;
    const tokensOut = balanceOut
      .mulDown(power.complement())
      .convertTo(
        this.balances[tokenIndexOut],
        this.poolParams.scalingFactors[tokenIndexOut]
      );

    return { tokensOut, feesPaid };
  }

  private _subtractSwapFeeAmount(tokensIn: TokenBalance) {
    const feePaid = tokensIn.scale(
      this.poolParams.swapFeePercentage.n,
      FixedPoint.ONE.n
    );

    return { tokensInMinusFees: tokensIn.sub(feePaid), feePaid };
  }

  private _getPreJoinExitProtocolFees() {
    if (this.poolParams.lastPostJoinExitInvariant === undefined)
      return this.totalSupply.copy(0);

    const invariant = this.balances.reduce((inv, b, i) => {
      return inv.mulDown(
        FixedPoint.from(b.scaleTo(18)).powDown(
          this.poolParams.normalizedWeights[i]
        )
      );
    }, FixedPoint.from(FixedPoint.ONE.n));
    const invariantGrowthRatio = invariant.divDown(
      this.poolParams.lastPostJoinExitInvariant
    );
    const supplyGrowthRatio = FixedPoint.ONE;

    if (
      supplyGrowthRatio.gte(invariantGrowthRatio) ||
      this.poolParams.swapFeePercentage.isZero()
    ) {
      return this.totalSupply.copy(0);
    }

    const swapFeePercentage = FixedPoint.ONE.sub(
      supplyGrowthRatio.divDown(invariantGrowthRatio)
    );
    const poolOwnershipPercentage = swapFeePercentage.mulDown(
      this.poolParams.swapFeePercentage
    );

    // This is the amount to increase the total supply by
    return FixedPoint.from(this.totalSupply.n)
      .mul(poolOwnershipPercentage)
      .div(poolOwnershipPercentage.complement())
      .convertTo(this.totalSupply, FixedPoint.ONE);
  }
}
