import {
  AccountDefinition,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  BorrowFixed,
  BorrowVariable,
  calculateCollateral,
  calculateConvertAsset,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeleverage,
  calculateDeleverageWithdraw,
  calculateRollDebt,
  ConvertAsset,
  Deleverage,
  Deposit,
  LendFixed,
  LendVariable,
  LeveragedLend,
  LeveragedNToken,
  LeveragedNTokenAdjustLeverage,
  MintNToken,
  RepayDebt,
  RollLendOrDebt,
  Withdraw,
} from '@notional-finance/transaction';
import { TransactionConfig } from './base-trade-store';
import { ZERO_ADDRESS } from '@notional-finance/util';

function onlySameCurrency(t: TokenDefinition, other?: TokenDefinition) {
  return other?.currencyId ? t.currencyId === other.currencyId : true;
}

function hasNToken(t: TokenDefinition, listedTokens: TokenDefinition[]) {
  return !!listedTokens.find(
    (_) => t.currencyId === _.currencyId && _.tokenType === 'nToken'
  );
}

function offsettingDebt(t: TokenDefinition, account: AccountDefinition | null) {
  return !!account?.balances.find(
    (b) =>
      ((b.tokenType === 'fCash' && b.isNegative()) ||
        b.tokenType === 'PrimeDebt') &&
      b.token.currencyId === t.currencyId
  );
}

function offsettingBalance(
  t: TokenDefinition,
  account: AccountDefinition | null,
  isFCashDebt?: boolean
) {
  if (t.tokenType === 'fCash' && isFCashDebt) {
    return !!account?.balances.find(
      (b) =>
        b.tokenType === 'fCash' &&
        b.token.currencyId === t.currencyId &&
        b.token.maturity === t.maturity &&
        b.isPositive()
    );
  } else if (t.tokenType === 'fCash') {
    return !!account?.balances.find(
      (b) =>
        b.tokenType === 'fCash' &&
        b.token.currencyId === t.currencyId &&
        b.token.maturity === t.maturity &&
        b.isNegative()
    );
  } else if (t.tokenType === 'PrimeCash') {
    return !!account?.balances.find(
      (b) =>
        b.token.currencyId === t.currencyId &&
        (b.tokenType === 'PrimeDebt' || (b.hasMatured && b.isNegative()))
    );
  } else if (t.tokenType === 'PrimeDebt') {
    return !!account?.balances.find(
      (b) =>
        b.token.currencyId === t.currencyId &&
        (b.tokenType === 'PrimeCash' || (b.hasMatured && b.isPositive()))
    );
  } else if (t.tokenType === 'nToken') {
    return !!account?.balances.find((b) => b.token.id === t.id);
  } else {
    return false;
  }
}

export const TradeConfiguration = {
  /***** Normal Transaction Actions *****/

  /**
   * Inputs:
   * selectedDepositToken, depositBalance, collateral
   *
   * Outputs:
   * collateralBalance (PrimeCash, fCash or nToken)
   */
  Deposit: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    collateralFilter: (t, _, s) =>
      onlySameCurrency(t, s.deposit) &&
      (t.vaultAddress === ZERO_ADDRESS || t.vaultAddress === undefined),
    debtFilter: () => false,
    calculateCollateralOptions: true,
    transactionBuilder: Deposit,
  } as TransactionConfig,

  /**
   * Input:
   * selectedDebtToken (fCash, Prime Cash, or nToken)
   * depositBalance (i.e. amount to wallet)
   *
   * Output:
   * debtBalance (i.e. amount of debt)
   */
  Withdraw: {
    calculationFn: calculateDebt,
    requiredArgs: ['debt', 'depositBalance', 'debtPool'],
    depositFilter: (t, _, s) => onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Matured fCash will not be in the list of available tokens
      (t.tokenType === 'fCash' ||
        t.tokenType === 'PrimeDebt' ||
        t.tokenType === 'nToken') &&
      offsettingBalance(t, a, true),
    collateralFilter: () => false,
    transactionBuilder: Withdraw,
  } as TransactionConfig,

  /**
   * Inputs:
   * selectedDepositToken, depositBalance
   * Outputs:
   * collateralBalance (PrimeCash)
   */
  LendVariable: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    collateralFilter: (t, _, s) =>
      t.tokenType === 'PrimeCash' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
    calculateCollateralOptions: true,
    transactionBuilder: LendVariable,
  } as TransactionConfig,
  /**
   * Inputs:
   * selectedDepositToken, depositBalance, selectedCollateralToken
   * Outputs:
   * collateralBalance (fCash)
   */
  LendFixed: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    depositFilter: (t, _, __, l) => hasNToken(t, l),
    collateralFilter: (t, _, s) =>
      t.tokenType === 'fCash' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
    calculateCollateralOptions: true,
    transactionBuilder: LendFixed,
  } as TransactionConfig,
  /**
   * Inputs:
   * selectedDepositToken, depositBalance
   * Outputs:
   * collateralBalance (nToken)
   */
  MintNToken: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    depositFilter: (t, _, __, l) => hasNToken(t, l),
    collateralFilter: (t, _a, s) =>
      t.tokenType === 'nToken' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
    calculateCollateralOptions: true,
    transactionBuilder: MintNToken,
  } as TransactionConfig,

  /**
   * Inputs:
   * selectedDepositToken, depositBalance (negative)
   * Outputs:
   * debtBalance (Prime Debt)
   */
  BorrowVariable: {
    calculationFn: calculateDebt,
    requiredArgs: ['debt', 'depositBalance', 'debtPool'],
    debtFilter: (t, _, s) =>
      t.tokenType === 'PrimeDebt' && onlySameCurrency(t, s.deposit),
    collateralFilter: () => false,
    calculateDebtOptions: true,
    transactionBuilder: BorrowVariable,
  } as TransactionConfig,

  /**
   * Inputs:
   * selectedDepositToken, depositBalance (negative)
   * Outputs:
   * debtBalance (fCash)
   */
  BorrowFixed: {
    calculationFn: calculateDebt,
    requiredArgs: ['debt', 'depositBalance', 'debtPool'],
    depositFilter: (t, _, __, l) => hasNToken(t, l),
    debtFilter: (t, _, s) =>
      t.tokenType === 'fCash' && onlySameCurrency(t, s.deposit),
    collateralFilter: () => false,
    calculateDebtOptions: true,
    transactionBuilder: BorrowFixed,
  } as TransactionConfig,

  /***** Leveraged Yield Actions ******/

  /**
   * Inputs:
   * selectedDepositToken
   * selectedDebtToken
   * selectedCollateralToken
   * depositBalance
   * riskLimit
   *
   * Outputs:
   * debtBalance (PrimeDebt, fCash)
   * collateralBalance (PrimeCash, fCash)
   */
  LeveragedLend: {
    calculationFn: calculateDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'riskFactorLimit',
      // NOTE: balances is not a required input b/c the leverage ratio
      // used in the risk factor limit is only calculated on a per trade basis
    ],
    collateralFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeCash') &&
      onlySameCurrency(t, s.deposit) &&
      (s.debt?.tokenType === 'PrimeDebt' ? t.tokenType !== 'PrimeCash' : true),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.deposit) &&
      (s.collateral?.tokenType === 'PrimeCash'
        ? t.tokenType !== 'PrimeDebt'
        : true),
    calculateCollateralOptions: true,
    calculateDebtOptions: true,
    transactionBuilder: LeveragedLend,
  } as TransactionConfig,

  /**
   * Inputs:
   * selectedDepositToken
   * selectedDebtToken
   * depositBalance
   * riskLimit
   *
   * Outputs:
   * debtBalance (PrimeDebt, fCash)
   * collateralBalance (nToken)
   */
  LeveragedNToken: {
    calculationFn: calculateDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'riskFactorLimit',
    ],
    depositFilter: (t, _, __, l) => hasNToken(t, l),
    collateralFilter: (t, _, s) =>
      t.tokenType === 'nToken' && onlySameCurrency(t, s.deposit),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.deposit),
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
    transactionBuilder: LeveragedNToken,
  } as TransactionConfig,

  IncreaseLeveragedNToken: {
    calculationFn: calculateDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'riskFactorLimit',
      'balances',
    ],
    depositFilter: (t, _, __, l) => hasNToken(t, l),
    collateralFilter: (t, _, s) =>
      t.tokenType === 'nToken' && onlySameCurrency(t, s.deposit),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.deposit),
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
    transactionBuilder: LeveragedNToken,
  } as TransactionConfig,

  LeveragedNTokenAdjustLeverage: {
    calculationFn: calculateDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'riskFactorLimit',
      'balances',
    ],
    // NOTE: collateral and debt can switch based on the risk factor limit
    depositFilter: (t, _, __, l) => hasNToken(t, l),
    collateralFilter: (t, a, s) =>
      onlySameCurrency(t, s.deposit) &&
      (s.debt?.tokenType === 'nToken'
        ? // show the offsetting debt
          offsettingBalance(t, a) &&
          (t.tokenType === 'fCash' || t.tokenType === 'PrimeCash')
        : // otherwise show the nToken
          t.tokenType === 'nToken'),
    debtFilter: (t, a, s) =>
      onlySameCurrency(t, s.deposit) &&
      (s.debt?.tokenType === 'nToken'
        ? // if the debt token is an nToken then only show that
          t.tokenType === 'nToken'
        : // otherwise only show the offsetting debt token
          offsettingDebt(t, a) &&
          (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt')),
    calculateDebtOptions: true,
    calculateCollateralOptions: true,
    transactionBuilder: LeveragedNTokenAdjustLeverage,
  } as TransactionConfig,

  /** Deleverage Yield Actions */

  /**
   * Inputs:
   * depositToken, collateral, debt (pre-selected)
   * withdrawAmount
   * riskFactorLimit (pre-selected)
   *
   * Outputs:
   * debtBalance (PrimeDebt, fCash, nToken)
   * collateralBalance (PrimeCash, fCash)
   */
  DeleverageWithdraw: {
    calculationFn: calculateDeleverageWithdraw,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'riskFactorLimit',
      'balances',
      'maxWithdraw',
    ],
    depositFilter: (t, _, s) => onlySameCurrency(t, s.collateral),
    collateralFilter: (t, a, s) =>
      t.tokenType !== 'nToken' &&
      onlySameCurrency(t, s.deposit) &&
      offsettingBalance(t, a, false),
    debtFilter: (t, a, s) =>
      onlySameCurrency(t, s.collateral) &&
      offsettingBalance(t, a, true) &&
      offsettingDebt(t, a),
    transactionBuilder: Deleverage,
    calculateCollateralOptions: true,
  } as TransactionConfig,

  /**
   * Inputs:
   * selectedDebtToken
   * selectedCollateralToken
   *
   * Outputs:
   * debtBalance (PrimeDebt, fCash, nToken)
   * collateralBalance (PrimeCash, fCash)
   */
  Deleverage: {
    calculationFn: calculateDeleverage,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'collateralBalance',
      'debtBalance',
    ],
    // In a deleverage trade a deposit should be set to zero
    depositFilter: () => false,
    collateralFilter: (t, a, s) =>
      t.tokenType !== 'nToken' &&
      onlySameCurrency(t, s.debt) &&
      offsettingBalance(t, a, false),
    debtFilter: (t, a, s) =>
      onlySameCurrency(t, s.collateral) &&
      offsettingBalance(t, a, true) &&
      offsettingDebt(t, a),
    transactionBuilder: Deleverage,
  } as TransactionConfig,

  /****** Portfolio Actions ******/

  /**
   * Inputs:
   * selectedCollateralToken (i.e. debt)
   * collateralBalance (i.e. debt to repay)
   *
   * Outputs:
   * depositBalance (i.e. cost to repay)
   *
   * NOTE: prime debt will be specified in prime debt units, or can
   * be specified in underlying
   */
  RepayDebt: {
    // Enter how much debt to repay, will calculate the cost
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    depositFilter: (t, a, s) =>
      !!a?.balances.find((b) => b.isNegative()) &&
      onlySameCurrency(t, s.collateral),
    collateralFilter: (t, a) =>
      // Matured fCash will not be in the list of available tokens
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeCash') &&
      offsettingBalance(t, a),
    debtFilter: () => false,
    transactionBuilder: RepayDebt,
  } as TransactionConfig,

  /**
   * Input:
   * selectedCollateralToken (i.e. new fCash or PrimeCash asset to hold)
   * selectedDebtToken (i.e. existing fCash or PrimeCash asset held)
   * debtBalance (i.e. part of fCash or PrimeCash asset to sell)
   *
   * Output:
   * collateralBalance (i.e. new fCash or PrimeCash asset amount held)
   */
  ConvertAsset: {
    calculationFn: calculateConvertAsset,
    requiredArgs: ['collateral', 'collateralPool', 'debtPool', 'debtBalance'],
    depositFilter: () => false,
    debtFilter: (t, a) =>
      (t.tokenType === 'fCash' ||
        t.tokenType === 'PrimeDebt' ||
        t.tokenType === 'nToken') &&
      offsettingBalance(t, a, true),
    collateralFilter: (t, _, s) =>
      // Selecting Prime Cash will roll to variable
      (t.tokenType === 'fCash' ||
        t.tokenType === 'PrimeCash' ||
        t.tokenType === 'nToken') &&
      onlySameCurrency(t, s.debt) &&
      // Cannot match maturities (if set) or token types
      (s.debt?.tokenType === 'fCash'
        ? t.maturity !== s.debt?.maturity
        : t.tokenType !== s.debt?.tokenType),
    calculateCollateralOptions: true,
    transactionBuilder: ConvertAsset,
  } as TransactionConfig,

  /**
   * Input:
   * selectedDebtToken (i.e. new debt to hold, fCash or Prime Debt)
   * selectedCollateralToken (i.e. existing debt held, fCash or Prime Cash)
   * collateralBalance (i.e. part of fCash or Prime Debt to repay)
   *
   * Output:
   * debtBalance (i.e. new debt amount held)
   */
  RollDebt: {
    // User will input amount of debt fcash to repay (i.e. collateral balance) and we calculate new fcash debt
    calculationFn: calculateRollDebt,
    requiredArgs: [
      'debt',
      'collateralPool',
      'debtPool',
      'collateral',
      'collateralBalance',
    ],
    collateralFilter: (t, a, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeCash') &&
      offsettingBalance(t, a) &&
      (s.deposit ? onlySameCurrency(t, s.deposit) : true),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.collateral) &&
      (s.collateral ? t.maturity !== s.collateral?.maturity : true),
    calculateDebtOptions: true,
    transactionBuilder: RollLendOrDebt,
  } as TransactionConfig,
};

export type TradeType = keyof typeof TradeConfiguration;
