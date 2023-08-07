import { TokenBalance } from '@notional-finance/core-entities';
import {
  PopulateTransactionInputs,
  populateNotionalTxnAndGas,
  getBalanceAndTradeAction,
  DepositActionType,
  getETHValue,
  getBalanceAction,
} from './common';

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
    !(
      collateralBalance?.isPositive() &&
      depositBalance?.isPositive() &&
      debtBalance?.isNegative()
    )
  ) {
    throw Error('All balances must be defined');
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
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs) {
  if (
    !(
      collateralBalance?.isNegative() &&
      depositBalance !== undefined &&
      debtBalance?.isPositive()
    )
  ) {
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
          false,
          undefined, // No Withdraws
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
}: PopulateTransactionInputs) {
  if (!depositBalance || !debtBalance)
    throw Error('All balances must be defined');

  // TODO: this requires a second transaction to convert the cash:
  // ConvertCashToNToken
  if (debtBalance.tokenType === 'fCash') {
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
            debtBalance.tokenType === 'fCash' ? [debtBalance] : []
          ),
        ],
        getETHValue(depositBalance),
      ]
    );
  } else if (
    debtBalance.tokenType === 'PrimeDebt' &&
    debtBalance.isNegative()
  ) {
    return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
      address,
      [
        getBalanceAction(
          DepositActionType.DepositUnderlying,
          depositBalance,
          false,
          undefined, // No Withdraws
          false
        ),
      ],
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
}: PopulateTransactionInputs) {
  if (!collateralBalance || !debtBalance)
    throw Error('All balances must be defined');

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          DepositActionType.RedeemNToken,
          debtBalance.neg(),
          false,
          undefined, // No Withdraws
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
