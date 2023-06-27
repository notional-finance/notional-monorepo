import { useContext } from 'react';
import {
  didIncrease,
  formatLeverageForRisk,
  formatPercentForRisk,
  RiskDataTableRow,
} from '@notional-finance/risk';
import { useHistoricalReturns } from './use-historical-returns';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { formatMaturity } from '@notional-finance/helpers';

export function useVaultDetailsTable() {
  const { priorVaultReturns, newVaultReturns } = useHistoricalReturns();
  const {
    state: { priorAccountRisk, postAccountRisk },
  } = useContext(VaultActionContext);

  if (!priorAccountRisk) {
    return {
      tableData: [],
      maturity: '',
    };
  }

  // These are all in underlying present value in the primary borrow currency
  const currentAssets = priorAccountRisk.assets;
  const updatedAssets = postAccountRisk?.assets;
  const currentDebts = priorAccountRisk.debts;
  const updatedDebts = postAccountRisk?.debts;

  const tableData: RiskDataTableRow[] = [
    {
      riskType: {
        type: 'Assets',
      },
      current: currentAssets?.toDisplayStringWithSymbol(2) || '-',
      updated: {
        value: updatedAssets?.toDisplayStringWithSymbol(2) || '-',
        arrowUp:
          (updatedAssets &&
            currentAssets &&
            !currentAssets.isZero() &&
            updatedAssets.gt(currentAssets)) ||
          null,
        checkmark: false,
        greenOnArrowUp: true,
        greenOnCheckmark: false,
      },
    },
    {
      riskType: {
        type: 'Debts',
      },
      current: currentDebts?.neg().toDisplayStringWithSymbol(2) || '-',
      updated: {
        value: updatedDebts?.neg().toDisplayStringWithSymbol(2) || '-',
        // NOTE: debts are negative so greater is lower
        arrowUp:
          (updatedDebts &&
            currentDebts &&
            !currentDebts.isZero() &&
            updatedDebts.lt(currentDebts)) ||
          null,
        checkmark: false,
        greenOnArrowUp: true,
        greenOnCheckmark: false,
      },
    },
    {
      riskType: {
        type: 'Leverage Ratio',
      },
      current: formatLeverageForRisk(priorAccountRisk.leverageRatio),
      updated: {
        value: formatLeverageForRisk(postAccountRisk?.leverageRatio),
        arrowUp:
          postAccountRisk?.leverageRatio !== null
            ? didIncrease(
                priorAccountRisk.leverageRatio,
                postAccountRisk?.leverageRatio
              )
            : null,
        checkmark: postAccountRisk?.leverageRatio === null,
        greenOnArrowUp: false,
        greenOnCheckmark: true,
      },
    },
  ];

  if (priorVaultReturns !== undefined && newVaultReturns !== undefined) {
    tableData.push({
      riskType: {
        type: 'APY',
      },
      current: formatPercentForRisk(priorVaultReturns),
      updated: {
        value: formatPercentForRisk(newVaultReturns),
        arrowUp: didIncrease(priorVaultReturns, newVaultReturns),
        checkmark: false,
        greenOnArrowUp: true,
        greenOnCheckmark: false,
      },
    });
  }

  return { tableData, maturity: formatMaturity(currentAssets.maturity) };
}
