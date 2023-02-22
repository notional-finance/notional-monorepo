import { useContext, useMemo } from 'react';
import {
  convertFloatToRate,
  convertRateToFloat,
  getNowSeconds,
  zipByKeyToArray,
} from '@notional-finance/helpers';
import {
  RATE_PRECISION,
  SECONDS_IN_DAY,
} from '@notional-finance/sdk/src/config/constants';
import { Market } from '@notional-finance/sdk/src/system';
import { useObservableState } from 'observable-hooks';
import {
  calculateHeadlineVaultReturns,
  vaultPerformance$,
} from '@notional-finance/notionable';
import { VaultActionContext } from '../vault-view/vault-action-provider';

export interface HistoricalReturn {
  timestamp: number;
  totalRate: number;
  breakdown: string[];
  leveragedReturn?: number;
}

export interface ReturnDriver {
  source: string;
  shortAvg: string;
  longAvg: string;
}

export const useHistoricalReturns = () => {
  const vaultPerformance = useObservableState(vaultPerformance$);
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, leverageRatio, fCashBorrowAmount, currentBorrowRate } =
    state;

  const performance = vaultAddress
    ? vaultPerformance?.get(vaultAddress)
    : undefined;

  const { historicalReturns, returnDrivers } = useMemo(() => {
    if (!performance || performance.historicalReturns.length === 0) {
      return {
        historicalReturns: [] as HistoricalReturn[],
        returnDrivers: [] as ReturnDriver[],
      };
    }
    const {
      historicalReturns: returns,
      sevenDayReturnDrivers,
      thirtyDayReturnDrivers,
      sevenDayTotalAverage,
      thirtyDayTotalAverage,
    } = performance;
    
    const historicalReturns = returns
      .filter((row) => row['timestamp'] > getNowSeconds() - 90 * SECONDS_IN_DAY)
      .map((row) => {
        const entries = Object.entries(row).filter(([h]) => h !== 'timestamp');
        const totalRate = entries.reduce((sum, [, v]) => sum + v, 0);
        const leveragedReturn = currentBorrowRate
          ? calculateHeadlineVaultReturns(
              convertFloatToRate(totalRate),
              convertFloatToRate(currentBorrowRate),
              leverageRatio
            )
          : undefined;

        return {
          timestamp: row['timestamp'],
          totalRate,
          leveragedReturn: leveragedReturn
            ? convertRateToFloat(leveragedReturn)
            : undefined,
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

    return { historicalReturns, returnDrivers };
  }, [performance, currentBorrowRate, leverageRatio]);

  const headlineApy = calculateHeadlineVaultReturns(
    performance?.sevenDayTotalAverage,
    currentBorrowRate ? convertFloatToRate(currentBorrowRate) : undefined,
    leverageRatio
  );

  return {
    returnDrivers,
    historicalReturns,
    currentBorrowRate,
    headlineApy: headlineApy ? convertRateToFloat(headlineApy) : undefined,
    fCashBorrowAmount,
  };
};
