import { RATE_PRECISION } from './constants';

export function formatInterestRate(rate: number, precision = 3) {
  if (rate === undefined) return '';
  const rateValue = (rate / RATE_PRECISION) * 100;
  // This removes the leading (-) when we have a -0.000% rate
  const rateString =
    Math.abs(rateValue) < 10 ** -precision
      ? (0).toFixed(precision)
      : rateValue.toFixed(precision);

  return `${rateString}%`;
}
