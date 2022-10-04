import FixedPoint from './FixedPoint';

export type BalancerLinearParams = {
  fee: FixedPoint;
  lowerTarget: FixedPoint;
  upperTarget: FixedPoint;
};

export default class BalancerLinearMath extends FixedPoint {
  public static calcInvariant(
    nominalMainBalance: FixedPoint,
    wrappedBalance: FixedPoint
  ) {
    return nominalMainBalance.add(wrappedBalance);
  }

  public static calcBptOutPerMainIn(
    mainIn: FixedPoint,
    mainBalance: FixedPoint,
    wrappedBalance: FixedPoint,
    bptSupply: FixedPoint,
    params: BalancerLinearParams
  ) {
    // Amount out, so we round down overall.

    if (bptSupply.isZero()) {
      // BPT typically grows in the same ratio the invariant does. The first time liquidity is added however, the
      // BPT supply is initialized to equal the invariant (which in this case is just the nominal main balance as
      // there is no wrapped balance).
      return this._toNominal(mainIn, params);
    }

    const previousNominalMain = this._toNominal(mainBalance, params);
    const afterNominalMain = this._toNominal(mainBalance.add(mainIn), params);
    const deltaNominalMain = afterNominalMain.sub(previousNominalMain);
    const invariant = this.calcInvariant(previousNominalMain, wrappedBalance);
    return bptSupply.mul(deltaNominalMain).divNoScale(invariant, false);
  }

  public static calcMainOutPerBptIn(
    bptIn: FixedPoint,
    mainBalance: FixedPoint,
    wrappedBalance: FixedPoint,
    bptSupply: FixedPoint,
    params: BalancerLinearParams
  ) {
    // Amount out, so we round down overall.

    const previousNominalMain = this._toNominal(mainBalance, params);
    const invariant = this.calcInvariant(previousNominalMain, wrappedBalance);
    const deltaNominalMain = invariant.mul(bptIn).divNoScale(bptSupply, false);
    const afterNominalMain = previousNominalMain.sub(deltaNominalMain);
    const newMainBalance = this._fromNominal(afterNominalMain, params);
    return mainBalance.sub(newMainBalance);
  }

  private static _toNominal(real: FixedPoint, params: BalancerLinearParams) {
    // Fees are always rounded down: either direction would work but we need to be consistent, and rounding down
    // uses less gas.

    if (real.lt(params.lowerTarget)) {
      const fees = params.lowerTarget.sub(real).mulDown(params.fee);
      return real.sub(fees);
    }
    if (real.lte(params.upperTarget)) {
      return real;
    }
    const fees = real.sub(params.upperTarget).mulDown(params.fee);
    return real.sub(fees);
  }

  private static _fromNominal(
    nominal: FixedPoint,
    params: BalancerLinearParams
  ) {
    // Since real = nominal + fees, rounding down fees is equivalent to rounding down real.

    if (nominal.lt(params.lowerTarget)) {
      return nominal
        .add(params.fee.mulDown(params.lowerTarget))
        .divDown(FixedPoint.ONE.add(params.fee));
    }
    if (nominal.lte(params.upperTarget)) {
      return nominal;
    }
    return nominal
      .sub(params.fee.mulDown(params.upperTarget))
      .divDown(FixedPoint.ONE.sub(params.fee));
  }
}
