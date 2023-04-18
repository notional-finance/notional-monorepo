import { useContext } from 'react';
import {
  convertFloatToRate,
  convertRateToFloat,
} from '@notional-finance/helpers';
import { calculateHeadlineVaultReturns } from '@notional-finance/notionable';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';

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
  const { state } = useContext(VaultActionContext);
  const {
    leverageRatio,
    fCashBorrowAmount,
    currentBorrowRate,
    avgBorrowRate,
    vaultAccount,
    baseVault,
    historicalReturns: _historicalReturns,
    returnDrivers,
    sevenDayAverageReturn,
  } = state;

  // If the current borrow rate is set, we show the expected yield for the net new portion
  const vaultAPYTitle = currentBorrowRate
    ? messages.summary.expectedYield
    : messages.summary.currentYield;

  // TODO: need to determine what the average borrow rate and leverage ratio to use here is.
  //  - net new position when increasing vault shares, calculated on net leverage, net cash and net borrow rate
  //  - historical average position prior to any changes
  //  - updated average with new net borrow rate

  const historicalReturns = _historicalReturns.map((row) => {
    const leveragedReturn = currentBorrowRate
      ? calculateHeadlineVaultReturns(
          convertFloatToRate(row.totalRate),
          convertFloatToRate(currentBorrowRate),
          leverageRatio
        )
      : undefined;

    return { ...row, leveragedReturn };
  });

  const netNewPositionApy = calculateHeadlineVaultReturns(
    sevenDayAverageReturn,
    currentBorrowRate ? convertFloatToRate(currentBorrowRate) : undefined,
    leverageRatio
  );

  const currentVaultAccountApy = calculateHeadlineVaultReturns(
    sevenDayAverageReturn,
    avgBorrowRate ? convertFloatToRate(avgBorrowRate) : undefined,
    baseVault && vaultAccount
      ? baseVault.getLeverageRatio(vaultAccount)
      : undefined
  );

  return {
    returnDrivers,
    historicalReturns,
    currentBorrowRate,
    netNewPositionApy: netNewPositionApy
      ? convertRateToFloat(netNewPositionApy)
      : undefined,
    currentVaultAccountApy: currentVaultAccountApy
      ? convertRateToFloat(currentVaultAccountApy)
      : undefined,
    fCashBorrowAmount,
    vaultAPYTitle,
  };
};
