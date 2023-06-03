import {
  AccountDefinition,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  calculateCollateral,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeposit,
} from '@notional-finance/transaction';
import { getNowSeconds } from '@notional-finance/util';
import { TransactionConfig } from './base-trade-store';

function onlySameCurrency(t: TokenDefinition, other?: TokenDefinition) {
  return other?.currencyId ? t.currencyId === other.currencyId : true;
}

function offsettingBalance(
  t: TokenDefinition,
  account: AccountDefinition | null
) {
  if (t.tokenType === 'fCash' && t.isFCashDebt) {
    return !!account?.balances.find(
      (b) =>
        b.token.tokenType === 'fCash' &&
        b.token.currencyId === t.currencyId &&
        b.token.maturity === t.maturity &&
        b.isPositive()
    );
  } else if (t.tokenType === 'fCash') {
    return !!account?.balances.find(
      (b) =>
        b.token.tokenType === 'fCash' &&
        b.token.currencyId === t.currencyId &&
        b.token.maturity === t.maturity &&
        b.isNegative()
    );
  } else if (t.tokenType === 'PrimeCash') {
    return !!account?.balances.find(
      (b) => b.token.tokenType === 'PrimeDebt' && b.currencyId === t.currencyId
    );
  } else if (t.tokenType === 'PrimeDebt') {
    return !!account?.balances.find(
      (b) => b.token.tokenType === 'PrimeCash' && b.currencyId === t.currencyId
    );
  } else if (t.tokenType === 'nToken') {
    return !!account?.balances.find((b) => b.token.id === t.id);
  } else {
    throw Error('Unknown offsetting token');
  }
}

function leveragedTrade(
  collateral: 'nToken' | 'fCash' | 'PrimeCash',
  debt: 'nToken' | 'fCash' | 'PrimeDebt'
): TransactionConfig {
  return {
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
    collateralFilter: (t, _, s) =>
      t.tokenType === collateral && onlySameCurrency(t, s.deposit),
    debtFilter: (t, _, s) =>
      t.tokenType === debt && onlySameCurrency(t, s.deposit),
  };
}

function deleverageTrade(
  collateral: 'fCash' | 'PrimeCash',
  debt: 'nToken' | 'fCash' | 'PrimeDebt'
): TransactionConfig {
  return {
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
      t.tokenType === collateral &&
      onlySameCurrency(t, s.debt) &&
      offsettingBalance(t, a),
    debtFilter: (t, a, s) =>
      t.tokenType === debt &&
      onlySameCurrency(t, s.collateral) &&
      offsettingBalance(t, a),
  };
}

export const TradeConfiguration: Record<string, TransactionConfig> = {
  /** Normal Transaction Actions */
  LendVariable: {
    // NOTE: this is also deposit
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance'],
    collateralFilter: (t, _, s) =>
      t.tokenType === 'PrimeCash' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
  },
  LendFixed: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    collateralFilter: (t, _, s) =>
      t.tokenType === 'fCash' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
  },
  MintNToken: {
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
    collateralFilter: (t, _a, s) =>
      t.tokenType === 'nToken' && onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
  },
  BorrowWithCollateral: {
    // NOTE: any debt (prime or fixed) can be specified and any collateral is
    // also accepted
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
      s?.debt?.tokenType === 'fCash'
        ? // Exclude the matching fCash asset
          !(
            t.tokenType === 'fCash' &&
            t.currencyId === s.debt.currencyId &&
            t.maturity === s.debt.maturity
          )
        : true,
    debtFilter: (t, _a, s) =>
      s?.collateral?.tokenType === 'fCash'
        ? // Exclude the matching fCash asset
          !(
            t.tokenType === 'fCash' &&
            t.currencyId === s.collateral.currencyId &&
            t.maturity === s.collateral.maturity
          )
        : true,
  },

  /** Leveraged Yield Actions */
  LendFixedWithVariableLeverage: leveragedTrade('fCash', 'PrimeDebt'),
  LendVariableWithFixedLeverage: leveragedTrade('PrimeCash', 'fCash'),
  MintNTokenWithVariableLeverage: leveragedTrade('nToken', 'PrimeDebt'),
  MintNTokenWithFixedLeverage: leveragedTrade('nToken', 'fCash'),

  /** Deleverage Yield Actions */
  DeleverageFixedLendWithVariableDebt: deleverageTrade('PrimeCash', 'fCash'),
  DeleverageVariableLendWithFixedDebt: deleverageTrade('fCash', 'PrimeDebt'),
  DeleverageNTokenWithVariableDebt: deleverageTrade('PrimeCash', 'nToken'),
  DeleverageNTokenWithFixedDebt: deleverageTrade('fCash', 'nToken'),

  /** Portfolio Actions **/
  RepayFixedDebt: {
    // Enter how much debt to repay, will calculate the cost
    calculationFn: calculateDeposit,
    requiredArgs: ['depositUnderlying', 'debtBalance', 'debtPool'],
    depositFilter: (t, a) =>
      !!a?.balances.find(
        (b) =>
          // Non Matured fCash
          b.token.tokenType === 'fCash' &&
          b.token.currencyId === t.currencyId &&
          (b.token.maturity || 0) > getNowSeconds() &&
          b.isNegative()
      ),
    collateralFilter: (t, a, s) =>
      // Matured fCash will not be in the list of available tokens
      t.tokenType === 'fCash' &&
      offsettingBalance(t, a) &&
      onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
  },
  RepayVariableDebt: {
    // TODO: we need to be able to clear dust balances here
    calculationFn: calculateDeposit,
    requiredArgs: ['depositUnderlying', 'debtBalance', 'debtPool'],
    depositFilter: (t, a) =>
      !!a?.balances.find(
        (b) =>
          b.token.tokenType === 'PrimeDebt' &&
          b.token.currencyId === t.currencyId &&
          b.isNegative()
      ),
    collateralFilter: (t, a, s) =>
      t.tokenType === 'PrimeDebt' &&
      offsettingBalance(t, a) &&
      onlySameCurrency(t, s.deposit),
    debtFilter: () => false,
  },
  RedeemNToken: {
    // NOTE: enter nTokens to redeem and we tell you the cash received
    calculationFn: calculateDeposit,
    requiredArgs: ['depositUnderlying', 'debtBalance', 'debtPool'],
    depositFilter: (t, a, s) =>
      !!a?.balances.find(
        (b) =>
          b.token.tokenType === 'nToken' &&
          b.token.currencyId === t.currencyId &&
          b.isPositive()
      ) && onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Find the matching nToken balance
      t.tokenType === 'nToken' && offsettingBalance(t, a),
    collateralFilter: () => false,
  },
  WithdrawCash: {
    // TODO: does this actually work? We need to test going from positive to negative
    // balances here...
    // TODO: also does not support redeem and withdraw from nToken
    calculationFn: calculateDebt,
    requiredArgs: ['depositUnderlying', 'debtBalance', 'debtPool'],
    depositFilter: (t, _, s) => onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Find the matching prime cash amount
      t.tokenType === 'PrimeDebt' && offsettingBalance(t, a),
    collateralFilter: () => false,
  },
  WithdrawLend: {
    // NOTE: this is the same as borrow fixed with no collateral
    calculationFn: calculateDebt,
    requiredArgs: ['debt', 'depositBalance', 'debtPool'],
    depositFilter: (t, _, s) => onlySameCurrency(t, s.debt),
    debtFilter: (t, a) =>
      // Matured fCash will not be in the list of available tokens
      t.tokenType === 'fCash' && offsettingBalance(t, a),
    collateralFilter: () => false,
  },
  RollFixedLend: {
    // User will input amount of lend fcash to sell (i.e. debt balance) and we calculate new collateral
    calculationFn: calculateCollateral,
    requiredArgs: ['collateral', 'collateralPool', 'debtPool', 'debtBalance'],
    depositFilter: () => false,
    debtFilter: (t, a) => t.tokenType === 'fCash' && offsettingBalance(t, a),
    collateralFilter: (t, _, s) =>
      // Selecting Prime Cash will roll to variable
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeCash') &&
      onlySameCurrency(t, s.debt) &&
      t.maturity !== s.debt?.maturity,
  },
  RollFixedDebt: {
    // User will input amount of debt fcash to repay (i.e. collateral balance) and we calculate new fcash debt
    calculationFn: calculateDebt,
    requiredArgs: ['debt', 'collateralPool', 'debtPool', 'collateralBalance'],
    depositFilter: () => false,
    collateralFilter: (t, a) =>
      t.tokenType === 'fCash' && offsettingBalance(t, a),
    debtFilter: (t, _, s) =>
      (t.tokenType === 'fCash' || t.tokenType === 'PrimeDebt') &&
      onlySameCurrency(t, s.collateral) &&
      t.maturity !== s.collateral?.maturity,
  },
};

export type TradeType = keyof typeof TradeConfiguration;
