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

export function LeveragedOrDeleverageLend({
  address,
  network,
  collateralBalance,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !depositBalance || !debtBalance)
    throw Error('All balances must be defined');

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
          debtBalance,
          false,
          undefined, // No Withdraws
          false,
          collateralBalance.tokenType === 'fCash' ? [debtBalance] : []
        ),
      ],
    ]
  );
}

export async function Deleverage(i: PopulateTransactionInputs) {
  if (i.collateralBalance?.tokenType === 'nToken') {
    return DeleverageNToken(i);
  } else {
    return LeveragedOrDeleverageLend(i);
  }
}
