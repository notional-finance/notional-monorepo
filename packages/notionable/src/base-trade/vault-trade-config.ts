import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { TransactionConfig, VaultTradeState } from './base-trade-store';
import { ConfigurationClient } from '@notional-finance/core-entities';
import {
  AdjustLeverage,
  DepositVault,
  EnterVault,
  ExitVault,
  RollVault,
  calculateVaultDebtCollateralGivenDepositRiskLimit,
  calculateVaultDeposit,
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
    transactionBuilder: AdjustLeverage,
  } as TransactionConfig,

  /**
   * Input:
   * depositBalance
   *
   * Output:
   * collateralBalance (vault shares)
   */
  DepositVaultCollateral: {
    calculationFn: calculateVaultDeposit,
    requiredArgs: [
      'collateral',
      'depositBalance',
      'vaultAdapter',
      // NOTE: these args below are not strictly required by the calculation
      // but are added here to manage race conditions when switching tradeTypes
      'debtPool',
      'balances',
      'vaultLastUpdateTime',
    ],
    collateralFilter: (t, a, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' &&
      t.vaultAddress === s.vaultAddress &&
      sameVaultMaturity(t, a?.balances, s.vaultAddress),
    debtFilter: () => false,
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    transactionBuilder: DepositVault,
    calculateDebtOptions: true,
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

  /**
   * Input:
   * depositBalance (i.e. withdraw amount)
   * selectedRiskLimit (i.e. new leverage ratio)
   *
   * Output:
   * collateralBalance (vault shares sold)
   * debtBalance (debt repaid)
   */
  WithdrawAndRepayVault: {
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
