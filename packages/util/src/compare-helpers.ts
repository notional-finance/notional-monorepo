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
