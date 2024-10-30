import { useContext } from 'react';
import { formatMaturity } from '@notional-finance/util';
import { VaultActionContext } from '../vault';
import {
  useCurrentTradeContext,
  useVaultDetails,
} from '@notional-finance/notionable-hooks';

export function useVaultDetailsTable() {
  const { state } = useContext(VaultActionContext);
  const trade = useCurrentTradeContext();
  const priorVaultBalances = trade?.getPriorVaultBalances();
  const { collateralBalance } = state;
  const {
    tableData,
    priorAccountNoRisk,
    postAccountNoRisk,
    tooRisky,
    onlyCurrent,
  } = useVaultDetails();

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
