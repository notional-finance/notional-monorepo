import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { BigNumber, ethers } from 'ethers';

const allCommas = /,{1}/g;

export function convertRateToFloat(rate: number) {
  return (rate / RATE_PRECISION) * 100;
}

export function convertFloatToRate(rate: number) {
  return (rate * RATE_PRECISION) / 100;
}

export function formatLeverageRatio(ratio: number, digits = 3) {
  return `${formatNumber(ratio / RATE_PRECISION, digits)}x`;
}

export function formatNumber(num: string | number, digits = 4) {
  const cleanedNumber = typeof num === 'string' ? num.replace(allCommas, '') : num;

  return parseFloat(`${cleanedNumber}`).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatNumberAsPercent(num: number | string, digits = 2) {
  return `${formatNumber(num, digits)}%`;
}

export function formatNumberAsInteger(num: number | string) {
  const cleanedNumber = typeof num === 'string' ? num.replace(allCommas, '') : num;

  return parseInt(`${cleanedNumber}`, 10).toLocaleString('en-US');
}

export function formatBigNumberToDecimals(bigNumber: BigNumber, decimals: number, digits = 4) {
  return formatNumber(ethers.utils.formatUnits(bigNumber, decimals), digits);
}
