import { useNotePrice } from '@notional-finance/notionable-hooks';
import { SECONDS_IN_DAY } from '@notional-finance/util';

export function useNoteSummary(_dateRange = 30 * SECONDS_IN_DAY) {
  const { notePrice, notePriceChange } = useNotePrice();

  return {
    // noteBurnChart,
    // totalNoteBurned,
    // noteAnnualBurnRate,
    notePrice,
    // This is the 24hr price change
    notePriceChange,
  };
}
