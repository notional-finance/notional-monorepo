import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { TransactionConfig, VaultTradeState } from './base-trade-store';
import { ConfigurationClient } from '@notional-finance/core-entities';
import {
  AdjustLeverage,
  EnterVault,
  ExitVault,
  RollVault,
  calculateVaultDebtCollateralGivenDepositRiskLimit,
  calculateVaultRoll,
} from '@notional-finance/transaction';
import {
  PRIME_CASH_VAULT_MATURITY,
  getMarketIndexForMaturity,
  getNowSeconds,
  isIdiosyncratic,
} from '@notional-finance/util';

function eligibleDebtToken(
  t: TokenDefinition,
  vaultConfig?: ReturnType<ConfigurationClient['getVaultConfig']>
) {
  return (
    t.tokenType === 'VaultDebt' &&
    t.vaultAddress === vaultConfig?.vaultAddress &&
    !!t.maturity &&
    !isIdiosyncratic(t.maturity) &&
    getMarketIndexForMaturity(t.maturity) <=
      (vaultConfig?.maxBorrowMarketIndex || 0)
  );
}

function isPrimaryCurrency(
  t: TokenDefinition,
  vaultConfig?: ReturnType<ConfigurationClient['getVaultConfig']>
) {
  return t.id === vaultConfig?.primaryBorrowCurrency.id;
}

function sameVaultMaturity(
  t: TokenDefinition,
  balances: TokenBalance[] = [],
  vaultAddress: string | undefined
): boolean {
  const maturity = balances.find(
    (t) =>
      (t.tokenType === 'VaultDebt' || t.tokenType === 'VaultShare') &&
      t.token.vaultAddress === vaultAddress
  )?.maturity;
  return maturity && maturity < getNowSeconds()
    ? t.maturity === PRIME_CASH_VAULT_MATURITY
    : t.maturity === maturity;
}

function matchingVaultShare(
  t: TokenDefinition,
  debt?: TokenDefinition
): boolean {
  return debt
    ? debt.maturity && debt.maturity < getNowSeconds()
      ? PRIME_CASH_VAULT_MATURITY === t.maturity
      : debt.maturity === t.maturity
    : true;
}

export const VaultTradeConfiguration = {
  /**
   * Input:
   * depositBalance
   * selectedRiskLimit (i.e. leverageRatio)
   * selectedDebtToken (i.e. new debt to hold, fCash or Prime Debt)
   *
   * Output:
   * collateralBalance (vault shares)
   * debtBalance (i.e. new debt amount held)
   */
  CreateVaultPosition: {
    calculationFn: calculateVaultDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'vaultAdapter',
      'debtPool',
      'depositBalance',
      'riskFactorLimit',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' && t.vaultAddress === s.vaultAddress,
    debtFilter: (t, _, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
    transactionBuilder: EnterVault,
  } as TransactionConfig,
  /**
   * Input:
   * depositBalance
   * selectedRiskLimit (i.e. leverageRatio)
   *
   * Output:
   * collateralBalance (vault shares)
   * debtBalance (i.e. new debt amount held)
   */
  IncreaseVaultPosition: {
    calculationFn: calculateVaultDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'vaultAdapter',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
      'vaultLastUpdateTime',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' &&
      t.vaultAddress === s.vaultAddress &&
      matchingVaultShare(t, s.debt),
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
    transactionBuilder: EnterVault,
  } as TransactionConfig,

  /**
   * Similar to IncreaseVaultPosition but the transaction builder can switch
   * between enter vault and exit vault.
   */
  AdjustVaultLeverage: {
    calculationFn: calculateVaultDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'vaultAdapter',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
      'vaultLastUpdateTime',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' &&
      t.vaultAddress === s.vaultAddress &&
      matchingVaultShare(t, s.debt),
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
    transactionBuilder: AdjustLeverage,
  } as TransactionConfig,

  /**
   * Input:
   * depositBalance
   * selectedRiskLimit (i.e. leverageRatio)
   * selectedDebtToken (i.e. new debt to hold, fCash or Prime Debt)
   *
   * Output:
   * collateralBalance (vault shares)
   * debtBalance (i.e. new debt amount held)
   */
  RollVaultPosition: {
    calculationFn: calculateVaultRoll,
    requiredArgs: [
      'debt',
      'vaultAdapter',
      'debtPool',
      'balances',
      'depositBalance',
      'vaultLastUpdateTime',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' &&
      t.vaultAddress === s.vaultAddress &&
      matchingVaultShare(t, s.debt),
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      !sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    transactionBuilder: RollVault,
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
  } as TransactionConfig,

  /**
   * Input:
   * depositBalance (i.e. withdraw amount)
   * selectedRiskLimit (i.e. current leverage ratio)
   *
   * Output:
   * collateralBalance (vault shares sold)
   * debtBalance (debt repaid)
   */
  WithdrawVault: {
    calculationFn: calculateVaultDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'vaultAdapter',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
      'vaultLastUpdateTime',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' &&
      t.vaultAddress === s.vaultAddress &&
      matchingVaultShare(t, s.debt),
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    transactionBuilder: ExitVault,
    calculateDebtOptions: true,
  } as TransactionConfig,
};

export type VaultTradeType = keyof typeof VaultTradeConfiguration;
