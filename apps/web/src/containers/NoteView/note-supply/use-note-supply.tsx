import { NOTERegistryClient, Registry } from '@notional-finance/core-entities';
import {
  SECONDS_IN_DAY,
  annualizedPercentChange,
  firstValue,
  getMidnightUTC,
  lastValue,
} from '@notional-finance/util';
import { useEffect, useState } from 'react';

export function useNoteSupply(dateRange = 30 * SECONDS_IN_DAY) {
  const [supplyData, setSupplyData] = useState<
    Awaited<ReturnType<NOTERegistryClient['getNOTESupplyData']>>
  >([]);
  const minDate = getMidnightUTC() - dateRange;

  useEffect(() => {
    Registry.getNOTERegistry()
      .getNOTESupplyData()
      .then((s) =>
        setSupplyData(s.filter(({ day }) => minDate < day.getTime() / 1000))
      );
  }, [minDate]);

  // TODO: implement this...
  // const annualEmissionRate = Registry.getNOTERegistry().getAnnualEmissionRate();
  const annualEmissionRate = 0;
  const noteHistoricalSupply: { day: Date; balance: number }[] =
    // TODO: change this in the data
    supplyData.filter(({ address }) => address === 'Circulating Supply');
  const noteBurnChart: { day: Date; balance: number }[] = supplyData.filter(
    ({ address }) => address === 'Burned'
  );

  const currentSupply = lastValue(noteHistoricalSupply)?.balance;
  const totalNoteBurned = lastValue(noteBurnChart)?.balance;
  const noteAnnualBurnRate = annualizedPercentChange(
    firstValue(noteBurnChart)?.balance,
    totalNoteBurned,
    dateRange
  );
  const currentSupplyChange = annualizedPercentChange(
    firstValue(noteHistoricalSupply)?.balance,
    currentSupply,
    dateRange
  );

  return {
    noteBurnChart,
    noteHistoricalSupply,
    totalNoteBurned,
    noteAnnualBurnRate,
    currentSupply,
    currentSupplyChange,
    annualEmissionRate,
  };
}
