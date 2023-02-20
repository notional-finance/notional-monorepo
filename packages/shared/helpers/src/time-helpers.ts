export function getNowSeconds() {
  if (
    (process.env['NODE_ENV'] === 'development' ||
      process.env['NODE_ENV'] === 'test') &&
    process.env['FAKE_TIME']
  ) {
    return parseInt(process.env['FAKE_TIME'], 10);
  }

  return Math.floor(new Date().getTime() / 1000);
}

export interface DateStringOptions {
  slashesFormat?: boolean;
  showTime?: boolean;
}

export function getDateString(
  timestampInSeconds: number,
  opts: DateStringOptions = {}
) {
  // Multiply by 1000 because javascript uses milliseconds.
  const date = new Date(timestampInSeconds * 1000);

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
  }

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  return `${month} ${day} ${year}`;
}

export const formatMaturity = (ts: number) => {
  if (ts) {
    return getDateString(ts);
  }
  return '';
};
