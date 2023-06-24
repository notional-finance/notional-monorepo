import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { TransactionConfig, VaultTradeState } from './base-trade-store';
import { ConfigurationClient } from '@notional-finance/core-entities';
import {
  EnterVault,
  ExitVault,
  RollVault,
  calculateVaultCollateral,
  calculateVaultDebt,
  calculateVaultDebtCollateralGivenDepositRiskLimit,
} from '@notional-finance/transaction';
import {
  getMarketIndexForMaturity,
  isIdiosyncratic,
} from '@notional-finance/util';

function eligibleDebtToken(
  t: TokenDefinition,
  vaultConfig?: ReturnType<ConfigurationClient['getVaultConfig']>
) {
  return (
    (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
    isPrimaryCurrency(t, vaultConfig) &&
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
  return (
    t.currencyId === parseInt(vaultConfig?.primaryBorrowCurrency.id || '0')
  );
}

function sameVaultMaturity(
  t: TokenDefinition,
  balances: TokenBalance[] = [],
  vaultAddress: string | undefined
): boolean {
  const maturity = balances.find(
    (t) => t.tokenType === 'VaultDebt' && t.token.vaultAddress === vaultAddress
  );
  return t.maturity === maturity;
}

export const VaultTradeConfiguration: Record<string, TransactionConfig> = {
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
      'collateralPool',
      'debtPool',
      'depositBalance',
      'balances',
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
  },
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
      'collateralPool',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' && t.vaultAddress === s.vaultAddress,
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    calculateDebtOptions: true,
    transactionBuilder: EnterVault,
  },

  /**
   * Input:
   * depositBalance
   *
   * Output:
   * collateralBalance (vault shares)
   */
  DepositVaultCollateral: {
    calculationFn: calculateVaultCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' && t.vaultAddress === s.vaultAddress,
    debtFilter: () => false,
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    transactionBuilder: EnterVault,
  },

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
    calculationFn: calculateVaultDebt,
    requiredArgs: [
      'collateral',
      'depositBalance',
      'collateralPool',
      'collateralBalance',
      'debtPool',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' && t.vaultAddress === s.vaultAddress,
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      !sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    transactionBuilder: RollVault,
  },

  /**
   * Input:
   * depositBalance (i.e. withdraw amount)
   * selectedRiskLimit (i.e. new leverage ratio)
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
      'collateralPool',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
    ],
    collateralFilter: (t, _, s: VaultTradeState) =>
      t.tokenType === 'VaultShare' && t.vaultAddress === s.vaultAddress,
    debtFilter: (t, a, s: VaultTradeState) =>
      eligibleDebtToken(t, s.vaultConfig) &&
      sameVaultMaturity(t, a?.balances, s.vaultAddress),
    depositFilter: (t, _, s: VaultTradeState) =>
      isPrimaryCurrency(t, s.vaultConfig),
    transactionBuilder: ExitVault,
  },
};
