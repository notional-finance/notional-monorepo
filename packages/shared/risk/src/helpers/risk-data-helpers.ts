import { ArrowIndicatorCellData } from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import {
  convertRateToFloat,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { ReactNode } from 'react';

export interface RiskDataTableRow {
  riskType: { type: ReactNode; icons?: string[] };
  current: string;
  updated: ArrowIndicatorCellData;
}

export function formatCurrencyForRisk(
  n?: TypedBigNumber | null,
  localCurrency = 'USD'
) {
  return !n || n.isZero()
    ? '-'
    : n.toCUR(localCurrency).toDisplayStringWithSymbol(2);
}

export function formatPercentForRisk(n?: number | null) {
  return n && n !== null ? formatNumberAsPercent(n, 1) : '-';
}

export function formatRateAsPercent(n?: number | null, digits = 1) {
  return n && n !== null
    ? formatNumberAsPercent(convertRateToFloat(n), digits)
    : '-';
}

export function formatLeverageForRisk(n?: number | null) {
  return n && n !== null ? `${n.toFixed(2)}x` : '-';
}

export function didIncrease(current?: number | null, updated?: number | null) {
  const currentIsDefined = current !== null && current !== undefined;
  const updatedIsDefined = updated !== null && updated !== undefined;
  // TODO: this shows a check on NULL, not sure if that is the
  // right behavior
  if (current === updated) {
    return null;
  } else if (!currentIsDefined && !updatedIsDefined) {
    return null;
  } else if (!currentIsDefined && updatedIsDefined) {
    return true;
  } else if (currentIsDefined && !updatedIsDefined) {
    return false;
  } else {
    return current! < updated!;
  }
}
