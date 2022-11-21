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
  formatRateAsPercent,
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

  const updatedAssets =
    baseVault && updatedVaultAccount
      ? baseVault.getCashValueOfShares(updatedVaultAccount)
      : undefined;
  const currentAssets =
    baseVault && currentVaultAccount
      ? baseVault.getCashValueOfShares(currentVaultAccount)
      : undefined;

  tableData.push({
    riskType: {
      type: 'Assets',
    },
    current: currentAssets?.toUnderlying().toDisplayStringWithSymbol(2) || '-',
    updated: {
      value: updatedAssets?.toUnderlying().toDisplayStringWithSymbol(2) || '-',
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
  });

  const updatedDebts =
    baseVault && updatedVaultAccount
      ? updatedVaultAccount.primaryBorrowfCash
      : undefined;
  const currentDebts =
    baseVault && currentVaultAccount
      ? currentVaultAccount.primaryBorrowfCash
      : undefined;

  tableData.push({
    riskType: {
      type: 'Debts',
    },
    current: currentDebts?.neg().toDisplayStringWithfCashSymbol(2) || '-',
    updated: {
      value: updatedDebts?.neg().toDisplayStringWithfCashSymbol(2) || '-',
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
  });

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
            : formatRateAsPercent(current?.rate),
        updated: {
          value:
            type === LiquidationThresholdType.exchangeRate
              ? updated?.ethExchangeRate?.toDisplayStringWithSymbol() || '-'
              : formatRateAsPercent(updated?.rate),
          arrowUp: current === undefined ? null : increase,
          checkmark: updated === undefined,
          greenOnArrowUp: false,
          greenOnCheckmark: true,
        },
      };
    })
  );

  return { tableData };
}
