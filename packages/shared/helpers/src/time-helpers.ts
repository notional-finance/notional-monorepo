import {
  PRIME_CASH_VAULT_MATURITY,
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
} from '@notional-finance/util';

export interface DateStringOptions {
  slashesFormat?: boolean;
  showTime?: boolean;
  hideYear?: boolean;
}

export function getDateString(
  timestampInSeconds: number,
  opts: DateStringOptions = {}
) {
  // Multiply by 1000 because javascript uses milliseconds.
  const date = new Date(timestampInSeconds * 1000);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });

  if (opts?.slashesFormat && opts?.showTime) {
    return `${date.toLocaleDateString('en-US')}, ${date.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )}`;
  } else if (opts?.slashesFormat) {
    return `${date.toLocaleDateString('en-US')}`;
  } else if (opts?.hideYear) {
    return `${month} ${day}`;
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

export const floorToMidnight = (ts: number, offset = 2 * SECONDS_IN_HOUR) => {
  // Offset puts a 2 hour delay on the tick over to midnight
  return ts - offset - ((ts - offset) % SECONDS_IN_DAY);
};
