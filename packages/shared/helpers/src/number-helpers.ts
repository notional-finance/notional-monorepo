import { RATE_PRECISION } from '@notional-finance/util';

const allCommas = /,{1}/g;

export function convertRateToFloat(rate: number) {
  return (rate / RATE_PRECISION) * 100;
}

export function convertFloatToRate(rate: number) {
  return (rate * RATE_PRECISION) / 100;
}

export function formatLeverageRatio(ratio: number, digits = 3) {
  return `${formatNumber(ratio, digits)}x`;
}

export function formatNumber(num: string | number, digits = 4) {
  const cleanedNumber =
    typeof num === 'string' ? num.replace(allCommas, '') : num;

  return parseFloat(`${cleanedNumber}`).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatNumberAsPercent(num: number | string, digits = 2) {
  return `${formatNumber(num, digits)}%`;
}

export function formatNumberAsAbbr(
  num: number,
  decimalPlaces = 3,
  locale = 'en-US'
) {
  let suffix = '';

  if (num < 1_000) {
    suffix = '';
  } else if (num < 1_000_000) {
    suffix = 'k';
    num = num / 1_000;
  } else if (num < 1_000_000_000) {
    suffix = 'm';
    num = num / 1_000_000;
  } else if (num < 1_000_000_000_000) {
    suffix = 'b';
    num = num / 1_000_000_000;
  } else {
    throw Error('Abbreviation overflow');
  }

  const localeString = num.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  // If the return string is -0.00 or some variant, strip the negative
  if (localeString.match(/-0\.?[0]*$/)) {
    return localeString.replace('-', '');
  }

  return `$${localeString}${suffix}`;
}
