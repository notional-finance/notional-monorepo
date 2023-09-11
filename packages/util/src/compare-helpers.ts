export function getChangeType(
  current: number | undefined | null,
  updated: number | undefined | null
) {
  if (!current && updated) return 'increase';
  else if (!updated && current) return 'cleared';
  else if (updated && current)
    return updated === current
      ? 'none'
      : updated > current
      ? 'increase'
      : 'decrease';
  else return 'none';
}

export function percentChange(
  current: number | undefined,
  updated: number | undefined
) {
  if (!current || updated === undefined) return undefined;
  return (100 * (current - updated)) / current;
}
