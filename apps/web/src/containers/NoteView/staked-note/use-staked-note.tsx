export function useStakedNote(dateRange = 30 * SECONDS_IN_DAY) {
  // TODO: Create a token balance object for sNOTE

  return {
    currentSNOTEPrice,
    totalSNOTEValue,
    currentSNOTEYield,
    annualizedRewardRate,
    historicalSNOTEPrice,
    walletNOTEBalance,
    walletSNOTEBalance,
    annualEmissionRate,
  };
}
