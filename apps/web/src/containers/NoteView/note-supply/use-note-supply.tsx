import {
  NOTERegistryClient,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { useNOTE } from '@notional-finance/notionable-hooks';
import {
  Network,
  SECONDS_IN_DAY,
  SECONDS_IN_YEAR_ACTUAL,
  annualizedPercentChange,
  firstValue,
  getMidnightUTC,
  lastValue,
} from '@notional-finance/util';
import { useEffect, useState } from 'react';

export function useNoteSupply(noteSupplyData, dateRange) {
  const [supplyData, setSupplyData] = useState<
    Awaited<ReturnType<NOTERegistryClient['getNOTESupplyData']>>
  >([]);
  const minDate = getMidnightUTC() - dateRange;
  const NOTE = useNOTE(Network.mainnet);

  useEffect(() => {
    if (noteSupplyData) {
      setSupplyData(
        noteSupplyData.filter(({ day }) => minDate < day.getTime() / 1000)
      );
    }
  }, [noteSupplyData, minDate]);

  const annualEmissionRate =
    Registry.getNOTERegistry().getTotalAnnualEmission();
  const noteHistoricalSupply: [Date, number][] = supplyData
    .filter(({ address }) => address === 'Circulating Supply')
    .map(({ day, balance }) => [day, balance]);
  const noteBurnChart: [Date, number][] = supplyData
    .filter(({ address }) => address === 'Burned')
    .map(({ day, balance }) => [day, balance]);

  const currentSupply = (lastValue(noteHistoricalSupply) ?? [
    undefined,
    undefined,
  ])[1];
  const totalNoteBurned = (lastValue(noteBurnChart) ?? [
    undefined,
    undefined,
  ])[1];
  const initialNOTEBurned = (firstValue(noteBurnChart) ?? [
    undefined,
    undefined,
  ])[1];

  let annualNOTEBurnRate: TokenBalance | undefined;
  let annualNOTEBurnPercentage: number | undefined;
  if (
    initialNOTEBurned !== undefined &&
    totalNoteBurned !== undefined &&
    NOTE
  ) {
    annualNOTEBurnRate = TokenBalance.fromFloat(
      (
        ((totalNoteBurned - initialNOTEBurned) * SECONDS_IN_YEAR_ACTUAL) /
        dateRange
      ).toFixed(8),
      NOTE
    );
    annualNOTEBurnPercentage = currentSupply
      ? (annualNOTEBurnRate.toFloat() * 100) / currentSupply
      : undefined;
  }

  const currentSupplyChange = annualizedPercentChange(
    currentSupply,
    (firstValue(noteHistoricalSupply) ?? [undefined, undefined])[1],
    dateRange
  );

  return {
    noteBurnChart,
    noteHistoricalSupply,
    totalNoteBurned,
    annualNOTEBurnRate,
    annualNOTEBurnPercentage,
    currentSupply:
      NOTE && currentSupply
        ? TokenBalance.fromFloat(currentSupply.toFixed(8), NOTE)
        : undefined,
    currentSupplyChange,
    annualEmissionRate,
  };
}
