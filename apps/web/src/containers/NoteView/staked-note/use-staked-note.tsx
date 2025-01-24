import { FiatKeys } from '@notional-finance/core-entities';
import {
  StakedNoteData,
  useSNOTEPool,
  useTotalNOTEBalances,
} from '@notional-finance/notionable-hooks';
import {
  RATE_PRECISION,
  getMidnightUTC,
  lastValue,
} from '@notional-finance/util';

export function useStakedNote(
  stakedNoteData: StakedNoteData | undefined,
  dateRange: number,
  baseCurrency: FiatKeys
) {
  const minDate = getMidnightUTC() - dateRange;
  const walletNOTEBalances = useTotalNOTEBalances();
  const sNOTEData =
    stakedNoteData?.filter(({ day }) => minDate < day.getTime() / 1000) || [];
  const historicalSNOTEPrice: [Date, number][] = sNOTEData.map(
    ({ day, price }) => [day, price || 0]
  );
  const historicalSNOTEAPY: [Date, number][] = sNOTEData.map(({ day, apy }) => [
    day,
    apy || 0,
  ]);
  const currentSNOTEYield = lastValue(sNOTEData)?.apy || undefined;
  const sNOTEPool = useSNOTEPool();

  const currentSNOTEPrice = sNOTEPool?.getCurrentSNOTEPrice();
  const totalSNOTEValue = sNOTEPool?.totalSNOTE.toFiat(baseCurrency);
  const annualizedRewardRate =
    currentSNOTEYield !== undefined
      ? totalSNOTEValue?.mulInRatePrecision(
          Math.floor((currentSNOTEYield * RATE_PRECISION) / 100)
        )
      : undefined;

  return {
    currentSNOTEPrice,
    totalSNOTEValue,
    currentSNOTEYield,
    annualizedRewardRate,
    historicalSNOTEPrice,
    historicalSNOTEAPY,
    walletNOTEBalances,
  };
}
