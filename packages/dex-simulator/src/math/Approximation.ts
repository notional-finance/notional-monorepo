import { BASIS_POINT } from '@notional-finance/sdk/config/constants';
import TypedBigNumber from '@notional-finance/sdk/libs/TypedBigNumber';

/**
 * This method does a bisection search to find the point where:
 *  abs(target - f(multiple)) < requiredPrecision
 *
 * The selected upper and lower bounds must meet the requirement:
 *   f(lowerBound) < target < f(upperBound)
 *
 * Or in other terms:
 *   f(lowerBound) - target < 0 < f(upperBound) - target
 *
 * https://en.wikipedia.org/wiki/Bisection_method#cite_note-1
 *
 * @param lowerBound lower bound estimate
 * @param upperBound upper bound estimate
 * @param target target value
 * @param func estimation function
 * @param tolerance error tolerance
 * @param maxIter maximum number of iterations
 * @returns value<T> returned by func
 */
export function doRepaymentBisectionSearch(
  upperBound: TypedBigNumber,
  lowerBound: TypedBigNumber,
  target: number,
  func: (repayment: TypedBigNumber) => number | null,
  tolerance = 50 * BASIS_POINT,
  maxIter = 25
) {
  let iters = 0;
  let currentUpper = upperBound;
  let currentLower = lowerBound;
  const fUpper = func(currentUpper);
  const fLower = func(currentLower);
  // If the lower bound implies a full exit, then we need to full exit
  if (fLower === null) return null;
  if (fUpper && Math.abs(fUpper - target) <= tolerance) return upperBound;
  if (Math.abs(fLower - target) <= tolerance) return lowerBound;
  if (fLower > target) throw RangeError('Lower bound above target');
  if (fUpper && fUpper < target) throw RangeError('Upper bound above target');

  do {
    const newMidpoint = currentUpper.add(currentLower).scale(1, 2);
    const estimatedTarget = func(newMidpoint);

    if (estimatedTarget === null) {
      // If we are about to hit max iterations, assume that we cannot
      // find a repayment point
      if (iters === maxIter - 1) return null;

      // If the estimated target is null then we should move towards
      // the lower bound repayment such that we find an estimate that
      // will execute
      currentUpper = newMidpoint;
    } else {
      const delta = target - estimatedTarget;
      if (Math.abs(delta) < tolerance) return newMidpoint;

      if (delta > 0) {
        // In this case we have repaid too much, move towards the lower
        currentLower = newMidpoint;
      } else {
        currentUpper = newMidpoint;
      }
    }

    iters += 1;
  } while (iters < maxIter);

  throw Error('Failed to converge');
}

export function doBinarySearch<T>(
  initialMultiple: number,
  target: number,
  calculationFunction: (multiple: number) => {
    actualMultiple: number;
    breakLoop: boolean;
    value: T;
  },
  requiredPrecision = 50 * BASIS_POINT,
  loopAdjustment = (m: number, d: number) => Math.floor(m + d / 2),
  maxIter = 25
) {
  let iters = 0;
  let delta = 0;
  let multiple = initialMultiple;

  do {
    const { actualMultiple, breakLoop, value } = calculationFunction(multiple);

    delta = target - actualMultiple;

    if (breakLoop || Math.abs(delta) < requiredPrecision) {
      return value;
    }

    multiple = loopAdjustment(multiple, delta); // Math.floor(multiple - delta * 2);
    iters += 1;
  } while (iters < maxIter);

  throw Error('Failed to converge');
}
