import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useFiat, useStakedNOTE } from '@notional-finance/notionable-hooks';
import { SECONDS_IN_DAY } from '@notional-finance/util';

export function useStakedNoteData(_dateRange = 30 * SECONDS_IN_DAY) {
  const sNOTE = useStakedNOTE();
  const baseCurrency = useFiat();
  const currentSNOTEPrice = TokenBalance.unit(sNOTE).toFiat(baseCurrency);
  const totalSNOTEValue = Registry.getNOTERegistry()
    .getTotalSNOTE()
    ?.toFiat(baseCurrency);
  const currentSNOTEYield = 22.31;

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
