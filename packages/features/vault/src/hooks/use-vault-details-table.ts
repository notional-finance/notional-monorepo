import { useContext } from 'react';
import { formatMaturity } from '@notional-finance/helpers';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { useVaultLiquidationRisk } from '@notional-finance/notionable-hooks';

export function useVaultDetailsTable() {
  const { state } = useContext(VaultActionContext);
  const { priorVaultBalances, collateralBalance } = state;
  const { tableData, priorAccountNoRisk, postAccountNoRisk } =
    useVaultLiquidationRisk(state);

  const maturity =
    collateralBalance?.maturity ||
    priorVaultBalances?.find((t) => t.tokenType === 'VaultShare')?.maturity;

  // const { priorVaultReturns, newVaultReturns } = useHistoricalReturns();
  // if (priorVaultReturns !== undefined && newVaultReturns !== undefined) {
  //   tableData.push({
  //     riskType: {
  //       type: 'APY',
  //     },
  //     current: formatPercentForRisk(priorVaultReturns),
  //     updated: {
  //       value: formatPercentForRisk(newVaultReturns),
  //       arrowUp: didIncrease(priorVaultReturns, newVaultReturns),
  //       checkmark: false,
  //       greenOnArrowUp: true,
  //       greenOnCheckmark: false,
  //     },
  //   });
  // }

  return {
    tableData:
      priorAccountNoRisk && postAccountNoRisk
        ? []
        : tableData.map(
            ({ label, current, updated, changeType, greenOnArrowUp }) => {
              return {
                label,
                current,
                updated: {
                  value: updated,
                  arrowUp: changeType === 'increase',
                  checkmark: changeType === 'cleared',
                  greenOnCheckmark: true,
                  greenOnArrowUp,
                },
              };
            }
          ),
    maturity: maturity ? formatMaturity(maturity) : '',
  };
}
