import { formatMaturity } from '@notional-finance/util';
import {
  useCurrentTradeContext,
  useVaultDetails,
} from '@notional-finance/notionable-hooks';

export function useVaultDetailsTable() {
  const trade = useCurrentTradeContext();
  const priorVaultBalances = trade?.getPriorVaultBalances();
  const collateralBalance = trade?.collateralBalance;
  const { tableData, tooRisky, onlyCurrent } = useVaultDetails();

  const maturity =
    collateralBalance?.maturity ||
    priorVaultBalances?.find((t) => t.tokenType === 'VaultShare')?.maturity;

  return {
    onlyCurrent,
    tableData: tableData.map(
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
