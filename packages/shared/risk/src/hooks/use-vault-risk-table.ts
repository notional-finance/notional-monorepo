import {
  getNowSeconds,
  logError,
  zipByKeyToArray,
} from '@notional-finance/helpers';
import {
  useBaseVault,
  useVaultAccount,
} from '@notional-finance/notionable-hooks';
import {
  LiquidationThreshold,
  LiquidationThresholdType,
} from '@notional-finance/sdk';
import { VaultAccount } from '@notional-finance/sdk/src/vaults';
import {
  didIncrease,
  formatLeverageForRisk,
  formatRateForRisk,
  RiskDataTableRow,
} from '../helpers/risk-data-helpers';

export function useVaultRiskTable(
  vaultAddress: string,
  updatedVaultAccount?: VaultAccount
) {
  const { vaultAccount: currentVaultAccount } = useVaultAccount(vaultAddress);
  const baseVault = useBaseVault(vaultAddress);

  let mergedThresholds: [
    LiquidationThreshold | undefined,
    LiquidationThreshold | undefined
  ][] = [];
  try {
    const currentThresholds =
      currentVaultAccount && baseVault
        ? baseVault.getLiquidationThresholds(
            currentVaultAccount,
            getNowSeconds()
          )
        : [];
    const updatedThresholds =
      updatedVaultAccount && baseVault
        ? baseVault.getLiquidationThresholds(
            updatedVaultAccount,
            getNowSeconds()
          )
        : [];
    mergedThresholds = zipByKeyToArray(
      currentThresholds,
      updatedThresholds,
      (t) => t.name
    );
  } catch (e) {
    logError(e as Error, 'use-vault-risk-table', 'getLiquidationThresholds');
  }

  const currentLeverage =
    currentVaultAccount?.hasLeverage && baseVault
      ? baseVault.getLeverageRatio(currentVaultAccount)
      : undefined;

  const updatedLeverage =
    updatedVaultAccount?.hasLeverage && baseVault
      ? baseVault.getLeverageRatio(updatedVaultAccount)
      : undefined;

  const tableData: RiskDataTableRow[] = [];

  if (currentLeverage) {
    tableData.push({
      riskType: {
        type: 'Leverage Ratio',
      },
      current: formatLeverageForRisk(currentLeverage),
      updated: {
        value: formatLeverageForRisk(updatedLeverage),
        arrowUp: updatedLeverage
          ? didIncrease(currentLeverage, updatedLeverage)
          : null,
        checkmark: updatedLeverage === null,
        greenOnArrowUp: false,
        greenOnCheckmark: true,
      },
    });
  }

  tableData.push(
    ...mergedThresholds.map(([current, updated]) => {
      const type: LiquidationThresholdType | undefined =
        current?.type || updated?.type;
      const increase =
        type === LiquidationThresholdType.exchangeRate
          ? didIncrease(
              current?.ethExchangeRate?.toFloat(),
              updated?.ethExchangeRate?.toFloat()
            )
          : didIncrease(current?.rate, updated?.rate);

      return {
        riskType: {
          type: (current?.name || updated?.name)!,
        },
        current:
          type === LiquidationThresholdType.exchangeRate
            ? current?.ethExchangeRate?.toDisplayStringWithSymbol() || '-'
            : formatRateForRisk(current?.rate),
        updated: {
          value:
            type === LiquidationThresholdType.exchangeRate
              ? updated?.ethExchangeRate?.toDisplayStringWithSymbol() || '-'
              : formatRateForRisk(updated?.rate),
          arrowUp: increase,
          checkmark: updated === undefined,
          greenOnArrowUp: false,
          greenOnCheckmark: true,
        },
      };
    })
  );

  return { tableData };
}
