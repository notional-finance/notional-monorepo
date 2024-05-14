import {
  NOTERegistryClient,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  useFiat,
  useStakedNOTEPoolReady,
  useTotalNOTEBalances,
} from '@notional-finance/notionable-hooks';
import {
  RATE_PRECISION,
  SECONDS_IN_DAY,
  getMidnightUTC,
  lastValue,
} from '@notional-finance/util';
import { useEffect, useState } from 'react';

export function useStakedNoteData(dateRange = 30 * SECONDS_IN_DAY) {
  const isPoolReady = useStakedNOTEPoolReady();
  const baseCurrency = useFiat();
  const [sNOTEData, setSNOTEData] = useState<
    Awaited<ReturnType<NOTERegistryClient['getSNOTEData']>>
  >([]);
  const minDate = getMidnightUTC() - dateRange;
  const walletNOTEBalances = useTotalNOTEBalances();

  useEffect(() => {
    Registry.getNOTERegistry()
      .getSNOTEData()
      .then((s) =>
        setSNOTEData(s.filter(({ day }) => minDate < day.getTime() / 1000))
      );
  }, [minDate]);

  let currentSNOTEPrice: TokenBalance | undefined;
  let totalSNOTEValue: TokenBalance | undefined;
  let annualizedRewardRate: TokenBalance | undefined;
  const historicalSNOTEPrice: [Date, number][] = sNOTEData.map(
    ({ day, price }) => [day, price]
  );
  const currentSNOTEYield = lastValue(sNOTEData)?.apy;

  if (isPoolReady) {
    const sNOTEPool = Registry.getExchangeRegistry().getSNOTEPool();
    currentSNOTEPrice = sNOTEPool?.getCurrentSNOTEPrice();
    totalSNOTEValue = sNOTEPool?.totalSNOTE.toFiat(baseCurrency);
    annualizedRewardRate =
      currentSNOTEYield !== undefined
        ? totalSNOTEValue?.mulInRatePrecision(
            Math.floor((currentSNOTEYield * RATE_PRECISION) / 100)
          )
        : undefined;
  }

  return {
    currentSNOTEPrice,
    totalSNOTEValue,
    currentSNOTEYield,
    annualizedRewardRate,
    historicalSNOTEPrice,
    walletNOTEBalances,
  };
}
