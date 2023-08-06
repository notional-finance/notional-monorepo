import {
  AccountDefinition,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  BorrowFixed,
  BorrowVariable,
  calculateCollateral,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeposit,
  ConvertAsset,
  Deleverage,
  Deposit,
  LendFixed,
  LendVariable,
  LeveragedNToken,
  LeveragedOrDeleverageLend,
  MintNToken,
  RepayDebt,
  RollLendOrDebt,
  Withdraw,
} from '@notional-finance/transaction';
import { TransactionConfig } from './base-trade-store';

function onlySameCurrency(t: TokenDefinition, other?: TokenDefinition) {
  return other?.currencyId ? t.currencyId === other.currencyId : true;
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
      (b) => b.tokenType === 'PrimeDebt' && b.currencyId === t.currencyId
    );
  } else if (t.tokenType === 'PrimeDebt') {
    return !!account?.balances.find(
      (b) => b.tokenType === 'PrimeCash' && b.currencyId === t.currencyId
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
    collateralFilter: (t, _, s) => onlySameCurrency(t, s.deposit),
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
      offsettingBalance(t, a),
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
    requiredArgs: ['collateral', 'depositBalance'],
    collateralFilter: (t, _, s) =>
      t.tokenType === 'PrimeCash' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
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
    collateralFilter: (t, _a, s) =>
      t.tokenType === 'nToken' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
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
    requiredArgs: ['debt', 'depositBalance'],
    debtFilter: (t, _, s) =>
      t.tokenType === 'PrimeDebt' && onlySameCurrency(t, s.deposit),
    collateralFilter: () => false,
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
    debtFilter: (t, _, s) =>
      t.tokenType === 'fCash' && onlySameCurrency(t, s.deposit),
    collateralFilter: () => false,
    calculateDebtOptions: true,
    transactionBuilder: BorrowFixed,
  } as TransactionConfig,

  /**
   * Specify:
   * selectedDepositToken
   * selectedCollateralToken
   * debtBalance (in Underlying)
   * depositBalance (for collateral)
   * riskLimit
   *
   * Outputs:
   * collateralBalance
   *
   * Notes:
   * Need to redesign the borrow flow, there are multiple options here
  BorrowWithCollateral: {
    // NOTE: any debt (prime or fixed) can be specified and any collateral is
    // also accepted:
    // TODO: this might be multiple different configurations....
    calculationFn: calculateDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
    ],
    collateralFilter: (t, _a, s) =>
      // Limit collateral options to the deposit currency
      onlySameCurrency(t, s.deposit) && s?.debt?.tokenType === 'fCash'
        ? // Exclude the matching fCash asset as the debt
          !(
            t.tokenType === 'fCash' &&
            t.currencyId === s.debt.currencyId &&
            t.maturity === s.debt.maturity
          )
        : true,
    debtFilter: (t, _a, s) =>
      s?.collateral?.tokenType === 'fCash'
        ? // Exclude the matching fCash asset as the collateral
          !(
            t.tokenType === 'fCash' &&
            t.currencyId === s.collateral.currencyId &&
            t.maturity === s.collateral.maturity
          )
        : true,
    calculateCollateralOptions: true,
    calculateDebtOptions: true,
    transactionBuilder: BorrowWithCollateral,
  } as TransactionConfig,
   */

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
    transactionBuilder: LeveragedOrDeleverageLend,
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
      // NOTE: balances is not a required input b/c the leverage ratio
      // used in the risk factor limit is only calculated on a per trade basis
    ],
    collateralFilter: (t, _, s) =>
      t.tokenType === 'nToken' && onlySameCurrency(t, s.deposit),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.deposit),
    calculateDebtOptions: true,
    transactionBuilder: LeveragedNToken,
  } as TransactionConfig,

  /** Deleverage Yield Actions */

  /**
   * Inputs:
   * selectedDebtToken
   * selectedCollateralToken
   * riskLimit
   * set depositBalance = 0
   *
   * Outputs:
   * debtBalance (PrimeDebt, fCash)
   * collateralBalance (PrimeCash, fCash)
   */
  Deleverage: {
    calculationFn: calculateDebtCollateralGivenDepositRiskLimit,
    requiredArgs: [
      'collateral',
      'debt',
      'collateralPool',
      'debtPool',
      'depositBalance',
      'balances',
      'riskFactorLimit',
    ],
    // In a deleverage trade a deposit should be set to zero
    depositFilter: () => false,
    collateralFilter: (t, a, s) =>
      t.tokenType !== 'nToken' &&
      onlySameCurrency(t, s.debt) &&
      offsettingBalance(t, a, false),
    debtFilter: (t, a, s) =>
      onlySameCurrency(t, s.collateral) && offsettingBalance(t, a, true),
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
    calculationFn: calculateDeposit,
    requiredArgs: ['depositUnderlying', 'collateralBalance', 'collateralPool'],
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
   * Inputs:
   * selectedDebtToken (nToken)
   * debtBalance (nTokens to redeem)
   *
   * Outputs:
   * depositBalance (cash to withdraw via nToken redeem)
  RedeemAndWithdrawNToken: {
    calculationFn: calculateDeposit,
    requiredArgs: ['depositUnderlying', 'debtBalance', 'debtPool'],
    depositFilter: (t, a, s) =>
      !!a?.balances.find(
        (b) =>
          b.tokenType === 'nToken' &&
          b.token.currencyId === t.currencyId &&
          b.isPositive()
      ) && onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Find the matching nToken balance
      t.tokenType === 'nToken' && offsettingBalance(t, a),
    collateralFilter: () => false,
    transactionBuilder: RedeemAndWithdrawNToken,
  } as TransactionConfig,
   */

  /**
   * Inputs:
   * selectedDebtToken (nToken)
   * debtBalance (nTokens to redeem)
   *
   * Outputs:
   * collateralBalance (cash to keep in portfolio via nToken redeem)
  RedeemToPortfolioNToken: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'debtBalance', 'debtPool'],
    collateralFilter: (t, a, s) =>
      !!a?.balances.find(
        (b) =>
          b.tokenType === 'nToken' &&
          b.token.currencyId === t.currencyId &&
          b.isPositive()
      ) && onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Find the matching nToken balance
      t.tokenType === 'nToken' && offsettingBalance(t, a),
    depositFilter: () => false,
    transactionBuilder: RedeemToPortfolioNToken,
  } as TransactionConfig,
   */

  /**
   * Input:
   * selectedDepositToken (i.e. token to withdraw)
   * depositBalance (i.e. amount to withdraw)
   *
   * Output:
   * debtBalance: (i.e. amount of prime cash to redeem)
   *
   * NOTE: this probably does not work as configured...
  WithdrawCashAndNToken: {
    // TODO: does this actually work? We need to test going from positive to negative
    // balances here...
    // TODO: also does not support redeem and withdraw from nToken
    calculationFn: calculateDebt,
    requiredArgs: ['depositUnderlying', 'depositBalance', 'debtPool'],
    depositFilter: (t, _, s) => onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Find the matching prime cash amount
      t.tokenType === 'PrimeDebt' && offsettingBalance(t, a),
    collateralFilter: () => false,
  },
   */

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
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'collateralPool', 'debtPool', 'debtBalance'],
    depositFilter: () => false,
    debtFilter: (t, a) =>
      (t.tokenType === 'fCash' ||
        t.tokenType === 'PrimeCash' || // TODO: is this actually prime debt?
        t.tokenType === 'nToken') &&
      offsettingBalance(t, a),
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
    calculationFn: calculateDebt,
    requiredArgs: ['debt', 'collateralPool', 'debtPool', 'collateralBalance'],
    depositFilter: () => false,
    collateralFilter: (t, a) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeCash') &&
      offsettingBalance(t, a),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.collateral) &&
      t.maturity !== s.collateral?.maturity,
    calculateDebtOptions: true,
    transactionBuilder: RollLendOrDebt,
  } as TransactionConfig,
};

export type TradeType = keyof typeof TradeConfiguration;
