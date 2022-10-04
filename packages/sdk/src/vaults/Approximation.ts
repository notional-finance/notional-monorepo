import { BASIS_POINT } from '../config/constants';

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
export function doBisectionSearch<T>(
  lowerBound: number,
  upperBound: number,
  target: number,
  func: (multiple: number) => {
    actualMultiple: number;
    breakLoop: boolean;
    value: T;
  },
  tolerance = 50 * BASIS_POINT,
  maxIter = 10
) {
  let iters = 0;
  let currentUpper = upperBound;
  let currentLower = lowerBound;
  // eslint-disable-next-line prefer-const
  let { actualMultiple: fUpper, value: uValue } = func(currentUpper);
  // eslint-disable-next-line prefer-const
  let { actualMultiple: fLower, value: lValue } = func(currentLower);
  if (Math.abs(fUpper - target) <= tolerance) return uValue;
  if (Math.abs(fLower - target) <= tolerance) return lValue;
  if (fLower > target) throw RangeError('Lower bound above target');
  if (fUpper < target) throw RangeError('Upper bound above target');

  do {
    const midpoint = Math.floor((currentUpper + currentLower) / 2);
    const { actualMultiple, breakLoop, value } = func(midpoint);
    const delta = target - actualMultiple;
    if (breakLoop || Math.abs(delta) < tolerance) {
      return value;
    }

    if (delta > 0 && currentUpper > currentLower) {
      currentUpper = midpoint;
    } else if (delta > 0 && currentUpper < currentLower) {
      currentLower = midpoint;
    } else if (delta < 0 && currentUpper > currentLower) {
      currentLower = midpoint;
    } else if (delta < 0 && currentUpper < currentLower) {
      currentUpper = midpoint;
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
  maxIter = 10
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
