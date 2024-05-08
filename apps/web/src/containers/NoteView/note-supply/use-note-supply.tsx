export function useNoteSupply(dateRange = 30 * SECONDS_IN_DAY) {
  return {
    currentSupply,
    currentSupplyChange,
    noteHistoricalSupply,
    annualEmissionRate,
  };
}
