import { TokenBalance } from '../..';
import { BigNumber, BigNumberish, ethers } from 'ethers';

export default class FixedPoint {
  static _1 = FixedPoint.from(1);

  static ONE = FixedPoint.from(ethers.constants.WeiPerEther);
  static TWO = FixedPoint.from(ethers.constants.WeiPerEther.mul(2));
  static FOUR = FixedPoint.from(ethers.constants.WeiPerEther.mul(4));

  constructor(public n: BigNumber) {}

  static convert(t: TokenBalance) {
    // All Balancer internal calculations are in 18 decimals
    return FixedPoint.from(t.scaleTo(18));
  }

  static from(v: BigNumberish) {
    if (v instanceof BigNumber) {
      return new FixedPoint(v);
    }
    return new FixedPoint(BigNumber.from(v));
  }

  static fromJSON(obj: ReturnType<FixedPoint['toJSON']>) {
    if (!obj._isFixedPoint) throw Error('Invalid JSON Fixed Point');
    return this.from(obj._hex);
  }

  add(b: FixedPoint) {
    return new FixedPoint(this.n.add(b.n));
  }

  sub(b: FixedPoint) {
    return new FixedPoint(this.n.sub(b.n));
  }

  mul(b: FixedPoint) {
    return new FixedPoint(this.n.mul(b.n));
  }

  div(b: FixedPoint) {
    return new FixedPoint(this.n.div(b.n));
  }

  lt(b: FixedPoint) {
    return this.n.lt(b.n);
  }

  lte(b: FixedPoint) {
    return this.n.lte(b.n);
  }

  gt(b: FixedPoint) {
    return this.n.gt(b.n);
  }

  eq(b: FixedPoint) {
    return this.n.eq(b.n);
  }

  isZero() {
    return this.n.isZero();
  }

  mulUp(b: FixedPoint) {
    const product = this.mul(b);
    return product.isZero()
      ? product
      : product.sub(FixedPoint._1).div(FixedPoint.ONE).add(FixedPoint._1);
  }

  mulDown(b: FixedPoint) {
    return this.mul(b).div(FixedPoint.ONE);
  }

  divUp(b: FixedPoint) {
    return b.isZero()
      ? this
      : this.mul(FixedPoint.ONE).sub(FixedPoint._1).div(b).add(FixedPoint._1);
  }

  divDown(b: FixedPoint) {
    return b.isZero() ? this : this.mul(FixedPoint.ONE).div(b);
  }

  divNoScale(b: FixedPoint, roundUp = false) {
    if (roundUp) {
      if (this.isZero()) return this;
      return FixedPoint._1.add(this.sub(FixedPoint._1).div(b));
    }
    return this.div(b);
  }

  convertTo(t: TokenBalance) {
    return t.copy(this.n.mul(t.precision).div(ethers.constants.WeiPerEther));
  }

  // Adapted from: https://github.com/balancer-labs/balancer-v2-monorepo/blob/a62e10f948c5de65ddfd6d07f54818bf82379eea/pkg/solidity-utils/contracts/math/FixedPoint.sol#L107
  powDown(pow: FixedPoint) {
    // Optimize for when y equals 1.0, 2.0 or 4.0, as those are very simple to implement and occur often in 50/50
    // and 80/20 Weighted Pools
    if (pow.eq(FixedPoint.ONE)) {
      return FixedPoint.from(this.n);
    } else if (pow.eq(FixedPoint.TWO)) {
      return this.mulDown(this);
    } else if (pow.eq(FixedPoint.FOUR)) {
      const square = this.mulDown(this);
      return square.mulDown(square);
    } else {
      const thisFloat = parseFloat(ethers.utils.formatUnits(this.n, 18));
      const powFloat = parseFloat(ethers.utils.formatUnits(pow.n, 18));
      return FixedPoint.from(
        ethers.utils.parseUnits((thisFloat ** powFloat).toString(), 18)
      );
    }
  }

  powUp(pow: FixedPoint) {
    // Optimize for when y equals 1.0, 2.0 or 4.0, as those are very simple to implement and occur often in 50/50
    // and 80/20 Weighted Pools
    if (pow.eq(FixedPoint.ONE)) {
      return FixedPoint.from(this.n);
    } else if (pow.eq(FixedPoint.TWO)) {
      return this.mulUp(this);
    } else if (pow.eq(FixedPoint.FOUR)) {
      const square = this.mulUp(this);
      return square.mulUp(square);
    } else {
      // Instead of replicating LogExpMath just calculate the power directly against the floating
      // point numbers
      const thisFloat = parseFloat(ethers.utils.formatUnits(this.n, 18));
      const powFloat = parseFloat(ethers.utils.formatUnits(pow.n, 18));
      return FixedPoint.from(
        ethers.utils.parseUnits((thisFloat ** powFloat).toString(), 18)
      );
    }
  }

  complement() {
    return this.lt(FixedPoint.ONE)
      ? FixedPoint.ONE.sub(this)
      : FixedPoint.from(0);
  }

  toJSON() {
    return {
      _isFixedPoint: true,
      _hex: this.n.toHexString(),
    };
  }
}
