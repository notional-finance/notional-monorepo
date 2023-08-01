import { BASIS_POINT } from './constants';

export function doSecantSearch<T>(
  x0: number,
  x1: number,
  fn: (x: number) => {
    fx: number;
    value: T;
  },
  minDelta = 1 * BASIS_POINT,
  maxIter = 100
) {
  let iters = 0;
  let { fx: fx_0 } = fn(x0);

  do {
    const { fx: fx_1, value } = fn(Math.floor(x1));

    if (fx_1 === fx_0) throw Error('Unable to converge: div by zero');
    const x2 = x1 - (fx_1 * (x1 - x0)) / (fx_1 - fx_0);

    if (Math.abs(fx_1) < minDelta) {
      return value;
    }

    // Assign next loop values
    fx_0 = fx_1;
    x0 = x1;
    x1 = x2;

    iters += 1;
  } while (iters < maxIter);

  throw Error('Failed to converge');
}
