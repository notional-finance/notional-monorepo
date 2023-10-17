import { useContext } from 'react';
import { formatMaturity } from '@notional-finance/helpers';
import { VaultActionContext } from '../vault';
import { useVaultLiquidationRisk } from '@notional-finance/notionable-hooks';

export function useVaultDetailsTable() {
  const { state } = useContext(VaultActionContext);
  const { priorVaultBalances, collateralBalance } = state;
  const { tableData, priorAccountNoRisk, postAccountNoRisk, tooRisky, onlyCurrent } =
    useVaultLiquidationRisk(state);

  const maturity =
    collateralBalance?.maturity ||
    priorVaultBalances?.find((t) => t.tokenType === 'VaultShare')?.maturity;

  return {
    onlyCurrent,
    tableData:
      priorAccountNoRisk && postAccountNoRisk
        ? []
        : tableData.map(
            ({ label, current, updated, changeType, greenOnArrowUp }) => {
              return {
                label,
                current: current,
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
    tooRisky,
  };
}
