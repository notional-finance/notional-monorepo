import {
  IS_LOCAL_ENV,
  PRIME_CASH_VAULT_MATURITY,
  SECONDS_IN_DAY,
  SECONDS_IN_QUARTER,
  SECONDS_IN_YEAR,
} from './constants';

export function getNowSeconds() {
  const fakeTime = process.env['FAKE_TIME'] || process.env['NX_FAKE_TIME'];
  const useFakeTime = process.env['USE_FAKE_TIME'] || IS_LOCAL_ENV;
  if (useFakeTime && fakeTime) {
    return parseInt(fakeTime, 10);
  }
  return Math.floor(new Date().getTime() / 1000);
}

export function getMidnightUTC(ts = getNowSeconds()) {
  return ts - (ts % SECONDS_IN_DAY);
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

export interface DateStringOptions {
  slashesFormat?: boolean;
  showTime?: boolean;
  hideYear?: boolean;
  monthYear?: boolean;
}

export function getDateString(
  timestamp: number,
  opts: DateStringOptions = {},
  inMilliseconds?: boolean
) {
  // Multiply by 1000 because javascript uses milliseconds.
  const formattedTimeStamp = inMilliseconds ? timestamp : timestamp * 1000;

  const date = new Date(formattedTimeStamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });

  if (opts?.slashesFormat && opts?.showTime) {
    return `${date.toISOString().split('T')[0]}, ${date.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }
    )}`;
  } else if (opts?.slashesFormat) {
    return `${date.toISOString().split('T')[0]}`;
  } else if (opts?.hideYear) {
    return `${month} ${day}`;
  } else if (opts?.monthYear) {
    return `${month} ${year}`;
  }

  return `${month} ${day} ${year}`;
}

export const formatMaturity = (ts: number) => {
  if (ts === PRIME_CASH_VAULT_MATURITY) {
    return 'Open Term';
  } else {
    return getDateString(ts);
  }
};

export const floorToMidnight = (ts: number, offset = 0) => {
  return ts - offset - ((ts - offset) % SECONDS_IN_DAY);
};

export const getDaysDifference = (timestamp: number): number => {
  const currentDate = getNowSeconds();
  const targetDate = timestamp;
  const differenceInDays = Math.floor(
    (currentDate - targetDate) / SECONDS_IN_DAY
  );
  return Math.abs(differenceInDays);
};
