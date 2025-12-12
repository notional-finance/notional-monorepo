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

export function pointsMultiple(
  multiple: number,
  leverageRatio: number | null | undefined
) {
  return multiple * ((leverageRatio || 0) + 1);
}

const allCommas = /,{1}/g;

export function formatNumber(num: string | number, decimals = 4) {
  const cleanedNumber =
    typeof num === 'string' ? num.replace(allCommas, '') : num;

  return parseFloat(`${cleanedNumber}`).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatNumberAsPercent(num: number | string, decimals = 2) {
  return `${formatNumber(num, decimals)}%`;
}

/**
 * Converts camelCase or PascalCase strings to readable text with spaces
 * @param text - The camelCase or PascalCase string to convert
 * @returns A string with spaces inserted before capital letters
 *
 * @example
 * camelCaseToReadable('EnterPosition') // returns 'Enter Position'
 * camelCaseToReadable('exitPosition') // returns 'exit Position'
 * camelCaseToReadable('manageVault') // returns 'manage Vault'
 */
export function camelCaseToReadable(text: string): string {
  return text.replace(/([A-Z])/g, ' $1').trim();
}

export function shortenTokenSymbol(symbol: string): string {
  if (symbol.startsWith('PT-')) return 'PT';
  if (symbol.toLowerCase() === 'unknown') return 'LP Token';
  return symbol;
}
