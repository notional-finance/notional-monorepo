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
  maxWithdraw,
  depositBalance,
}: PopulateTransactionInputs) {
  if (!(collateralBalance?.isNegative() && debtBalance?.isPositive())) {
    throw Error('Collateral and Debt must be defined');
  }

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
          maxWithdraw,
          maxWithdraw ? undefined : depositBalance?.neg().toPrimeCash(),
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
}: PopulateTransactionInputs) {
  if (!collateralBalance || !debtBalance)
    throw Error('All balances must be defined');

  // Adjust the debt balance up slightly to reduce the chance of dust balances
  // causing fCash to fail.
  const adjustedDebtBalance = debtBalance
    .mulInRatePrecision(RATE_PRECISION + 0.01 * BASIS_POINT)
    .neg();
  
  const { withdrawEntireCashBalance, withdrawAmountInternalPrecision } =
    hasExistingCashBalance(depositBalance || debtBalance, accountBalances);
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
          collateralBalance.tokenType === 'fCash' ? [collateralBalance] : []
        ),
      ],
    ]
  );
}

export async function Deleverage(i: PopulateTransactionInputs) {
  if (i.debtBalance?.tokenType === 'nToken') {
    return DeleverageNToken(i);
  } else if (i.collateralBalance?.isPositive() && i.debtBalance?.isNegative()) {
    return LeveragedLend(i);
  } else {
    return DeleverageLend(i);
  }
}

export function LeveragedNTokenAdjustLeverage(i: PopulateTransactionInputs) {
  if (i.collateralBalance?.tokenType === 'nToken') {
    return LeveragedLend(i);
  } else {
    return DeleverageNToken(i);
  }
}
