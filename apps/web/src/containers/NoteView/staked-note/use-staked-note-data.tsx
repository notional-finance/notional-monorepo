import { TokenBalance } from '@notional-finance/core-entities';
import { useFiat, useStakedNOTEPool } from '@notional-finance/notionable-hooks';
import { SECONDS_IN_DAY } from '@notional-finance/util';

export function useStakedNoteData(_dateRange = 30 * SECONDS_IN_DAY) {
  const sNOTEPool = useStakedNOTEPool();
  const baseCurrency = useFiat();
  let currentSNOTEPrice: TokenBalance | undefined;
  let totalSNOTEValue: TokenBalance | undefined;
  let currentSNOTEYield: number | undefined;

  if (sNOTEPool) {
    currentSNOTEPrice = sNOTEPool.getCurrentSNOTEPrice();
    totalSNOTEValue = sNOTEPool.totalSNOTE.toFiat(baseCurrency);
    currentSNOTEYield = 22.31;
  }

  return {
    currentSNOTEPrice,
    totalSNOTEValue,
    currentSNOTEYield,
    // annualizedRewardRate,
    // historicalSNOTEPrice,
    // walletNOTEBalance,
    // walletSNOTEBalance,
  };
}
