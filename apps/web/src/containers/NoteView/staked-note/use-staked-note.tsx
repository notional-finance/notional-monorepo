import { FiatKeys, NOTERegistryClient } from '@notional-finance/core-entities';
import {
  StakedNoteData,
  useSNOTEPool,
  useTotalNOTEBalances,
} from '@notional-finance/notionable-hooks';
import {
  RATE_PRECISION,
  SECONDS_IN_DAY,
  getMidnightUTC,
  lastValue,
} from '@notional-finance/util';
import { useEffect, useState } from 'react';

export function useStakedNote(
  stakedNoteData: StakedNoteData | undefined,
  dateRange = 30 * SECONDS_IN_DAY,
  baseCurrency: FiatKeys
) {
  const [sNOTEData, setSNOTEData] = useState<
    Awaited<ReturnType<NOTERegistryClient['getSNOTEData']>>
  >([]);
  const minDate = getMidnightUTC() - dateRange;
  const walletNOTEBalances = useTotalNOTEBalances();

  useEffect(() => {
    if (stakedNoteData) {
      setSNOTEData(
        stakedNoteData.filter(({ day }) => minDate < day.getTime() / 1000)
      );
    }
  }, [stakedNoteData, minDate]);

  const historicalSNOTEPrice: [Date, number][] = sNOTEData.map(
    ({ day, price }) => [day, price]
  );
  const historicalSNOTEAPY: [Date, number][] = sNOTEData.map(({ day, apy }) => [
    day,
    apy,
  ]);
  const currentSNOTEYield = lastValue(sNOTEData)?.apy;
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
