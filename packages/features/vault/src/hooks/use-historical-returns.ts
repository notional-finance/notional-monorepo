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
    priorAvgBorrowRate,
    totalCashBorrowed,
    currentBorrowRate,
    cashBorrowed,
    vaultAccount,
    baseVault,
    historicalReturns: _historicalReturns,
    returnDrivers,
    sevenDayAverageReturn,
  } = state;

  // priorAvgBorrowRate = weightedRate / totalCashBorrowed
  // newAverageBorrowRate = cashBorrowed / newTotalCashBorrowed * priorAvgBorrowRate +
  //    totalCashBorrowed / newTotalCashBorrowed * currentBorrowRate
  let newAverageBorrowRateInRatePrecision: number | undefined;
  const currentBorrowRateInRatePrecision =
    currentBorrowRate !== undefined
      ? convertFloatToRate(currentBorrowRate)
      : undefined;

  if (
    priorAvgBorrowRate &&
    totalCashBorrowed &&
    cashBorrowed &&
    currentBorrowRateInRatePrecision
  ) {
    const newTotalCashBorrowed = totalCashBorrowed.add(cashBorrowed).toFloat();
    const _cashBorrowed = cashBorrowed.toFloat();
    const _totalCashBorrowed = totalCashBorrowed.toFloat();

    newAverageBorrowRateInRatePrecision =
      priorAvgBorrowRate * (_cashBorrowed / newTotalCashBorrowed) +
      currentBorrowRateInRatePrecision *
        (_totalCashBorrowed / newTotalCashBorrowed);
  } else if (currentBorrowRateInRatePrecision) {
    newAverageBorrowRateInRatePrecision = currentBorrowRateInRatePrecision;
  }

  const historicalReturns = (_historicalReturns || []).map((row) => {
    const chartRate = newAverageBorrowRateInRatePrecision || priorAvgBorrowRate;
    const leveragedReturn = chartRate
      ? calculateHeadlineVaultReturns(
          convertFloatToRate(row.totalRate),
          chartRate,
          leverageRatio
        )
      : undefined;

    return {
      ...row,
      leveragedReturn: leveragedReturn
        ? convertRateToFloat(leveragedReturn)
        : undefined,
    };
  });

  const newVaultReturns = calculateHeadlineVaultReturns(
    sevenDayAverageReturn,
    newAverageBorrowRateInRatePrecision,
    leverageRatio
  );

  const priorVaultReturns = calculateHeadlineVaultReturns(
    sevenDayAverageReturn,
    priorAvgBorrowRate,
    baseVault && vaultAccount
      ? baseVault.getLeverageRatio(vaultAccount)
      : undefined
  );

  // If the account is borrowing fCash then set the expected yield
  const vaultAPYTitle =
    newVaultReturns !== undefined
      ? messages.summary.expectedYield
      : messages.summary.currentYield;

  const headlineApy =
    newVaultReturns !== undefined ? newVaultReturns : priorVaultReturns;

  return {
    returnDrivers: returnDrivers || [],
    historicalReturns,
    priorVaultReturns: priorVaultReturns
      ? convertRateToFloat(priorVaultReturns)
      : undefined,
    newVaultReturns: newVaultReturns
      ? convertRateToFloat(newVaultReturns)
      : undefined,
    fCashBorrowAmount,
    headlineApy: headlineApy ? convertRateToFloat(headlineApy) : undefined,
    vaultAPYTitle,
    currentBorrowRate,
  };
};
