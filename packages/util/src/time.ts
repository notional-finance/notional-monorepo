import {
  IS_LOCAL_ENV,
  PRIME_CASH_VAULT_MATURITY,
  SECONDS_IN_QUARTER,
  SECONDS_IN_YEAR,
} from './constants';

export function getNowSeconds() {
  const fakeTime = process.env['FAKE_TIME'] || process.env['NX_FAKE_TIME'];
  if (IS_LOCAL_ENV && fakeTime) {
    return parseInt(fakeTime, 10);
  }
  return Math.floor(new Date().getTime() / 1000);
}

export function getTimeReference(timestamp = getNowSeconds()) {
  return timestamp - (timestamp % SECONDS_IN_QUARTER);
}

export function getMarketMaturityLengthSeconds(marketIndex: number) {
  if (marketIndex === 1) return SECONDS_IN_QUARTER;
  if (marketIndex === 2) return 2 * SECONDS_IN_QUARTER;
  if (marketIndex === 3) return SECONDS_IN_YEAR;
  if (marketIndex === 4) return 2 * SECONDS_IN_YEAR;
  if (marketIndex === 5) return 5 * SECONDS_IN_YEAR;
  if (marketIndex === 6) return 10 * SECONDS_IN_YEAR;
  if (marketIndex === 7) return 20 * SECONDS_IN_YEAR;

  return 0;
}

export function isIdiosyncratic(maturity: number, blockTime = getNowSeconds()) {
  return getMarketIndexForMaturity(maturity, blockTime) === -1;
}

export function getMarketIndexForMaturity(
  maturity: number,
  blockTime = getNowSeconds()
) {
  if (maturity === PRIME_CASH_VAULT_MATURITY) return 0;

  for (let i = 1; i <= 7; i += 1) {
    if (maturity === getMaturityForMarketIndex(i, blockTime)) return i;
  }

  // Is idiosyncratic
  return -1;
}

export function getMaturityForMarketIndex(
  marketIndex: number,
  blockTime = getNowSeconds()
) {
  const tRef = getTimeReference(blockTime);
  return tRef + getMarketMaturityLengthSeconds(marketIndex);
}
