import { zipByKeyToArray } from '@notional-finance/helpers';
import { RATE_PRECISION, SECONDS_IN_DAY } from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/system';
import { getNowSeconds } from '@notional-finance/util';
import { VaultPerformance } from '../vault-store';

interface HistoricalReturnsDependencies {
  vaultPerformance: VaultPerformance;
}

export function getHistoricalReturns({
  vaultPerformance,
}: HistoricalReturnsDependencies) {
  if (vaultPerformance.historicalReturns.length == 0) {
    return {
      historicalReturns: [],
      returnDrivers: [],
    };
  }

  const {
    historicalReturns: returns,
    sevenDayReturnDrivers,
    thirtyDayReturnDrivers,
    sevenDayTotalAverage,
    thirtyDayTotalAverage,
  } = vaultPerformance;

  const historicalReturns = returns
    .filter((row) => row['timestamp'] > getNowSeconds() - 90 * SECONDS_IN_DAY)
    .map((row) => {
      const entries = Object.entries(row).filter(([h]) => h !== 'timestamp');
      const totalRate = entries.reduce((sum, [, v]) => sum + v, 0);

      return {
        timestamp: row['timestamp'],
        totalRate,
        // NOTE: this calculate has moved to use-historical returns
        // leveragedReturn: leveragedReturn
        //   ? convertRateToFloat(leveragedReturn)
        //   : undefined,
        breakdown: entries.map(
          ([k, v]) =>
            `${k}: ${Market.formatInterestRate(
              Math.floor((v * RATE_PRECISION) / 100),
              2
            )}`
        ),
      };
    });

  const returnDrivers = zipByKeyToArray(
    sevenDayReturnDrivers,
    thirtyDayReturnDrivers,
    (r) => r.source
  )
    .map(([seven, thirty]) => {
      return {
        // Non-null assertion is valid because of how zipByKeyToArray works
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        source: (seven?.source || thirty?.source)!,
        shortAvg: Market.formatInterestRate(seven?.avg || 0),
        longAvg: Market.formatInterestRate(thirty?.avg || 0),
      };
    })
    .concat({
      source: 'Total Returns',
      shortAvg: Market.formatInterestRate(sevenDayTotalAverage),
      longAvg: Market.formatInterestRate(thirtyDayTotalAverage),
    });

  return {
    historicalReturns,
    returnDrivers,
    sevenDayAverageReturn: sevenDayTotalAverage,
  };
}
