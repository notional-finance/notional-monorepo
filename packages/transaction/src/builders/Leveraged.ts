import { Registry, TokenBalance } from '@notional-finance/core-entities';
import {
  PopulateTransactionInputs,
  populateNotionalTxnAndGas,
  getBalanceAndTradeAction,
  DepositActionType,
  getETHValue,
  populateTxnAndGas,
  hasExistingCashBalance,
} from './common';
import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';

export function EnablePrimeBorrow({
  address,
  network,
}: PopulateTransactionInputs) {
  return populateNotionalTxnAndGas(network, address, 'enablePrimeBorrow', [
    true,
  ]);
}

export function DisablePrimeBorrow({
  address,
  network,
}: PopulateTransactionInputs) {
  return populateNotionalTxnAndGas(network, address, 'enablePrimeBorrow', [
    false,
  ]);
}

export function LeveragedLend({
  address,
  network,
  collateralBalance,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs) {
  if (
    !(collateralBalance?.isPositive() && debtBalance?.isNegative()) ||
    collateralBalance?.currencyId !== debtBalance?.currencyId
  ) {
    throw Error('All balances must be defined');
  }

  if (depositBalance === undefined) {
    depositBalance = collateralBalance.toUnderlying().copy(0);
  }

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          DepositActionType.DepositUnderlying,
          depositBalance,
          false,
          undefined, // No Withdraws
          false,
          [collateralBalance, debtBalance].filter(
            (t) => t.tokenType === 'fCash'
          )
        ),
      ],
      getETHValue(depositBalance),
    ]
  );
}

export function DeleverageLend({
  address,
  network,
  collateralBalance,
  debtBalance,
  accountBalances,
}: PopulateTransactionInputs) {
  if (
    !(collateralBalance?.isPositive() && debtBalance?.isNegative()) ||
    collateralBalance?.currencyId !== debtBalance?.currencyId
  ) {
    throw Error('All balances must be defined');
  }

  const { withdrawEntireCashBalance } = hasExistingCashBalance(
    collateralBalance,
    accountBalances
  );

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          DepositActionType.None,
          TokenBalance.zero(collateralBalance.underlying), // no deposits
          // If collateralBalance is prime cash, then this is repaying prime debt and we
          // want to make sure that we do not end up with dust. Any positive amount will be
          // withdrawn.
          withdrawEntireCashBalance ||
            collateralBalance.tokenType === 'PrimeCash',
          undefined,
          false,
          [collateralBalance, debtBalance].filter(
            (t) => t.tokenType === 'fCash'
          )
        ),
      ],
    ]
  );
}

export function LeveragedNToken({
  address,
  network,
  depositBalance,
  debtBalance,
  collateralBalance,
  accountBalances,
}: PopulateTransactionInputs) {
  if (!depositBalance || !debtBalance || !collateralBalance)
    throw Error('All balances must be defined');

  const adapter =
    Registry.getConfigurationRegistry().getLeveragedNTokenAdapter(network);
  const { cashBalance } = hasExistingCashBalance(
    collateralBalance,
    accountBalances
  );
  const hasCash = !!cashBalance;

  if (debtBalance.tokenType === 'fCash') {
    const borrowAction = [
      getBalanceAndTradeAction(
        DepositActionType.DepositUnderlying,
        depositBalance,
        false,
        undefined, // No Withdraws
        false,
        [debtBalance]
      ),
    ];

    return populateTxnAndGas(adapter, address, 'doLeveragedNToken', [
      borrowAction,
      // Use a zero if the account does not have cash to ensure that no dust
      // is left behind
      hasCash ? collateralBalance.toPrimeCash().n : 0,
      getETHValue(depositBalance),
    ]);
  } else if (
    debtBalance.tokenType === 'PrimeDebt' &&
    debtBalance.isNegative()
  ) {
    const borrowAction = [
      getBalanceAndTradeAction(
        DepositActionType.DepositUnderlying,
        depositBalance,
        false,
        undefined, // No Withdraws
        false,
        []
      ),
    ];

    return populateTxnAndGas(adapter, address, 'doLeveragedNToken', [
      borrowAction,
      collateralBalance.toPrimeCash().n,
      getETHValue(depositBalance),
    ]);
  } else {
    throw Error('Invalid nToken Leverage');
  }
}

export function DeleverageNToken({
  address,
  network,
  collateralBalance,
  debtBalance,
  accountBalances,
  depositBalance,
  maxWithdraw,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !debtBalance)
    throw Error('All balances must be defined');
  const nTokenBalance = accountBalances.find(
    (t) => t.tokenId == debtBalance.tokenId
  );

  // Adjust the debt balance up slightly to reduce the chance of dust balances
  // causing fCash to fail.
  const adjustedDebtBalance =
    maxWithdraw || nTokenBalance?.eq(debtBalance.abs())
      ? debtBalance.neg()
      : debtBalance
          .mulInRatePrecision(RATE_PRECISION + 0.01 * BASIS_POINT)
          .neg();

  let {
    // eslint-disable-next-line prefer-const
    cashBalance,
    withdrawEntireCashBalance,
    withdrawAmountInternalPrecision,
  } = hasExistingCashBalance(
    depositBalance?.neg() || debtBalance,
    accountBalances
  );

  if (depositBalance === undefined && maxWithdraw === false) {
    withdrawEntireCashBalance = false;
    withdrawAmountInternalPrecision = undefined;
  } else if (
    maxWithdraw &&
    cashBalance?.isNegative() &&
    collateralBalance.tokenType === 'PrimeCash'
  ) {
    // In this case, we can safely execute a max withdraw because we are repaying a prime debt
    // and any residual cash from deleverage can be cleared
    withdrawEntireCashBalance = true;
    withdrawAmountInternalPrecision = undefined;
  }

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          DepositActionType.RedeemNToken,
          adjustedDebtBalance,
          withdrawEntireCashBalance,
          withdrawAmountInternalPrecision,
          false,
          collateralBalance.tokenType === 'fCash' ? [collateralBalance] : [],
          // Increase slippage limit for nTokens to account for the fact that we are
          // also removing liquidity and moving the price at the same time
          collateralBalance.tokenType === 'fCash' ? 25 * BASIS_POINT : undefined
        ),
      ],
    ]
  );
}

export async function Deleverage(i: PopulateTransactionInputs) {
  if (i.debtBalance?.tokenType === 'nToken') {
    return DeleverageNToken(i);
  } else {
    return DeleverageLend(i);
  }
}

export function LeveragedNTokenAdjustLeverage(i: PopulateTransactionInputs) {
  if (i.collateralBalance?.tokenType === 'nToken') {
    return LeveragedNToken(i);
  } else {
    return DeleverageNToken(i);
  }
}
