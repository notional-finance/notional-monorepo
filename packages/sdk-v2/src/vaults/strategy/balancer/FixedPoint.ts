import { BigNumber, ethers } from 'ethers';

export default class FixedPoint {
  public static _1 = FixedPoint.from(1);

  public static ONE = FixedPoint.from(ethers.constants.WeiPerEther);

  constructor(public n: BigNumber) {}

  public static from(v: any) {
    if (v instanceof BigNumber) {
      return new FixedPoint(v);
    }
    return new FixedPoint(BigNumber.from(v));
  }

  public add(b: FixedPoint) {
    return new FixedPoint(this.n.add(b.n));
  }

  public sub(b: FixedPoint) {
    return new FixedPoint(this.n.sub(b.n));
  }

  public mul(b: FixedPoint) {
    return new FixedPoint(this.n.mul(b.n));
  }

  public div(b: FixedPoint) {
    return new FixedPoint(this.n.div(b.n));
  }

  public lt(b: FixedPoint) {
    return this.n.lt(b.n);
  }

  public lte(b: FixedPoint) {
    return this.n.lte(b.n);
  }

  public gt(b: FixedPoint) {
    return this.n.gt(b.n);
  }

  public isZero() {
    return this.n.isZero();
  }

  public mulUp(b: FixedPoint) {
    const product = this.mul(b);
    return product.isZero() ? product : product.sub(FixedPoint._1).div(FixedPoint.ONE).add(FixedPoint._1);
  }

  public mulDown(b: FixedPoint) {
    return this.mul(b).div(FixedPoint.ONE);
  }

  public divUp(b: FixedPoint) {
    return b.isZero() ? this : this.mul(FixedPoint.ONE).sub(FixedPoint._1).div(b).add(FixedPoint._1);
  }

  public divDown(b: FixedPoint) {
    return b.isZero() ? this : this.mul(FixedPoint.ONE).div(b);
  }

  public divNoScale(b: FixedPoint, roundUp: boolean) {
    if (roundUp) {
      if (this.isZero()) return this;
      return FixedPoint._1.add(this.sub(FixedPoint._1).div(b));
    }
    return this.div(b);
  }

  public complement() {
    return this.lt(FixedPoint.ONE) ? FixedPoint.ONE.sub(this) : FixedPoint.from(0);
  }

  public toJSON() {
    return {
      _isFixedPoint: true,
      _hex: this.n.toHexString(),
    };
  }
}
