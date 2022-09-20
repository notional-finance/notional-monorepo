import { BigNumber, ethers } from 'ethers';
import { BigNumberType, TypedBigNumber } from '..';
import { INTERNAL_TOKEN_PRECISION } from '../config/constants';
import { System } from '../system';

/**
 * Balancer pool math adapted from this code. Although the code is incorrect in a few places:
 * https://github.com/officialnico/balancerv2cad/blob/main/src/balancerv2cad/WeightedMath.py#L74
 */
export default class BalancerPool {
  public static readonly BPT_PRECISION = ethers.constants.WeiPerEther;

  public static readonly ETH_WEIGHT = ethers.utils.parseEther('0.2');

  public static readonly NOTE_WEIGHT = ethers.utils.parseEther('0.8');

  /**
   * Returns the amount of BPT tokens expected given the two inputs.
   *
   * @dev Adapted from `calc_bpt_out_given_exact_tokens_in` in the python file above.
   * @param noteAmount
   * @param ethAmount
   * @returns
   */
  public static getExpectedBPT(noteAmount: TypedBigNumber, ethAmount: TypedBigNumber) {
    const {
      ethBalance,
      swapFee,
      noteBalance,
      balancerPoolTotalSupply: totalSupply,
    } = System.getSystem().getStakedNoteParameters();
    noteAmount.checkType(BigNumberType.NOTE);
    ethAmount.check(BigNumberType.ExternalUnderlying, 'ETH');
    // These two ratios calculate how much the pool balance will change on a normalized basis.
    // ratio = (balance + amount) / balance
    const ethBalanceRatioWithFee = ethBalance.add(ethAmount).scale(BalancerPool.BPT_PRECISION, ethBalance.n).n;
    const noteBalanceRatioWithFee = noteBalance
      .add(noteAmount)
      .scale(INTERNAL_TOKEN_PRECISION, noteBalance.n)
      // This needs to be scaled up to 1e18 to match the ethBalanceRatio precision
      .scale(1e10, 1).n;

    // The invariant ratio with fees calculates the normalized change to the invariant given the
    // two deposit amounts. The invariant ratio is: (ethRatio ** 0.2) * (noteRatio ** 0.8), this
    // formula calculates the log of those two figures:
    // log(invariant) = 0.2 * log(ethRatio) + 0.8 * log(noteRatio)
    const invariantRatioWithFees = ethBalanceRatioWithFee
      .mul(BalancerPool.ETH_WEIGHT)
      .div(BalancerPool.BPT_PRECISION)
      .add(noteBalanceRatioWithFee.mul(BalancerPool.NOTE_WEIGHT).div(BalancerPool.BPT_PRECISION));

    let ethInWithoutFee: TypedBigNumber;
    let noteInWithoutFee: TypedBigNumber;

    if (ethBalanceRatioWithFee.gt(invariantRatioWithFees)) {
      // If depositing ETH (ethBalanceRatioWithFee > 1) will result in the invariant moving
      // away from it's target position (invariantRatioWithFees == 1) then we need to apply
      // a swap fee to the ethAmount.
      const nonTaxableAmount = ethBalance.scale(
        invariantRatioWithFees.sub(BalancerPool.BPT_PRECISION),
        BalancerPool.BPT_PRECISION
      );
      const taxableAmount = ethAmount.sub(nonTaxableAmount);
      ethInWithoutFee = nonTaxableAmount.add(
        taxableAmount.scale(BalancerPool.BPT_PRECISION.sub(swapFee), BalancerPool.BPT_PRECISION)
      );
    } else {
      ethInWithoutFee = ethAmount;
    }

    const balanceRatioEth = ethBalance.add(ethInWithoutFee).scale(BalancerPool.BPT_PRECISION, ethBalance.n);
    let invariantRatio = ethers.utils.parseUnits((parseFloat(balanceRatioEth.toExactString()) ** 0.2).toFixed(18), 18);

    if (noteBalanceRatioWithFee.gt(invariantRatioWithFees)) {
      // This will calculate whatever remains after the eth swap fee has been applied. If the invariant
      // ratio is still above one then part of the noteAmount will be subject to a swap fee as well.
      // noteBalance * (log(invariantRatio) - 1)
      const nonTaxableAmount = noteBalance.scale(
        invariantRatioWithFees.sub(BalancerPool.BPT_PRECISION),
        BalancerPool.BPT_PRECISION
      );
      const taxableAmount = noteAmount.sub(nonTaxableAmount);
      noteInWithoutFee = nonTaxableAmount.add(
        taxableAmount.scale(BalancerPool.BPT_PRECISION.sub(swapFee), BalancerPool.BPT_PRECISION)
      );
    } else {
      noteInWithoutFee = noteAmount;
    }

    const balanceRatioNote = noteBalance.add(noteInWithoutFee).scale(INTERNAL_TOKEN_PRECISION, noteBalance.n);
    const invariantRatioNote = ethers.utils.parseUnits(
      (parseFloat(balanceRatioNote.toExactString()) ** 0.8).toFixed(8),
      8
    );
    invariantRatio = invariantRatio.mul(invariantRatioNote).div(INTERNAL_TOKEN_PRECISION);

    if (invariantRatio.gte(BalancerPool.BPT_PRECISION)) {
      return totalSupply.mul(invariantRatio.sub(BalancerPool.BPT_PRECISION)).div(BalancerPool.BPT_PRECISION);
    }
    throw Error('Insufficient liquidity');
  }

  public static getOptimumETHForNOTE(noteAmount: TypedBigNumber) {
    const { ethBalance, noteBalance } = System.getSystem().getStakedNoteParameters();
    const ethAmount = noteAmount.scale(ethBalance.n, noteBalance.n).n;
    return TypedBigNumber.fromBalance(ethAmount, 'ETH', false);
  }

  public static getSpotPrice() {
    return BalancerPool.getExpectedPriceImpact(
      TypedBigNumber.fromBalance(0, 'NOTE', false),
      TypedBigNumber.fromBalance(0, 'ETH', false)
    );
  }

  /**
   * Returns the spot price of 1 NOTE in USD
   * @param spotPrice NOTE per ETH in 18 decimals
   */
  public static spotPriceToUSD(spotPrice: BigNumber) {
    return TypedBigNumber.fromBalance(spotPrice, 'ETH', false).toInternalPrecision().toUSD();
  }

  public static getExpectedPriceImpact(noteAmount: TypedBigNumber, ethAmount: TypedBigNumber) {
    const { ethBalance, noteBalance } = System.getSystem().getStakedNoteParameters();
    noteAmount.checkType(BigNumberType.NOTE);
    ethAmount.check(BigNumberType.ExternalUnderlying, 'ETH');
    // Scale NOTE token up to 1e18 for the ratio
    const noteRatio = noteBalance
      .add(noteAmount)
      .scale(1e10, 1)
      .scale(BalancerPool.BPT_PRECISION, BalancerPool.NOTE_WEIGHT).n;
    const ethRatio = ethBalance.add(ethAmount).scale(BalancerPool.BPT_PRECISION, BalancerPool.ETH_WEIGHT).n;

    // Returns the expected NOTE/ETH price after some investment (does not take fees into account)
    return ethRatio.mul(BalancerPool.BPT_PRECISION).div(noteRatio);
  }

  public static getStakedNOTEExchangeRate() {
    const { ethValue, noteValue } = this.getStakedNOTEPoolValue();
    const { sNOTETotalSupply } = System.getSystem().getStakedNoteParameters();
    return ethValue.add(noteValue.toETH(false)).scale(this.BPT_PRECISION, sNOTETotalSupply);
  }

  public static getStakedNOTEPoolValue() {
    const {
      ethBalance,
      sNOTEBptBalance,
      noteBalance,
      balancerPoolTotalSupply: totalSupply,
    } = System.getSystem().getStakedNoteParameters();
    const ethValue = ethBalance.scale(sNOTEBptBalance, totalSupply);
    const noteValue = noteBalance.scale(sNOTEBptBalance, totalSupply);
    return { ethValue, noteValue, usdValue: ethValue.toUSD().add(noteValue.toUSD()) };
  }

  public static getBptValue() {
    const { ethBalance, noteBalance, balancerPoolTotalSupply } = System.getSystem().getStakedNoteParameters();
    const ethValue = ethBalance.scale(1, balancerPoolTotalSupply);
    const noteValue = noteBalance.scale(1, balancerPoolTotalSupply);
    return { ethValue, noteValue, usdValue: ethValue.toUSD().add(noteValue.toUSD()) };
  }
}
