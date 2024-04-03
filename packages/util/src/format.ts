import { RATE_PRECISION } from './constants';

export function formatInterestRate(rate?: number, precision = 3) {
  if (rate === undefined) return '';
  const rateValue = (rate / RATE_PRECISION) * 100;
  // This removes the leading (-) when we have a -0.000% rate
  const rateString =
    Math.abs(rateValue) < 10 ** -precision
      ? (0).toFixed(precision)
      : rateValue.toFixed(precision);

  return `${rateString}%`;
}

export function leveragedYield(
  strategyAPY: number | undefined,
  borrowAPY: number | undefined,
  leverageRatio: number | null | undefined
) {
  if (
    strategyAPY === undefined ||
    borrowAPY === undefined ||
    leverageRatio === undefined ||
    leverageRatio === null
  )
    return undefined;
  return strategyAPY + (strategyAPY - borrowAPY) * leverageRatio;
}
