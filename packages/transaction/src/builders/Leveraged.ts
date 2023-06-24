import {
  PopulateTransactionInputs,
  populateNotionalTxnAndGas,
  getBalanceAndTradeAction,
  DepositActionType,
  getETHValue,
} from './common';

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
  collateralBalance,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !depositBalance || !debtBalance)
    throw Error('All balances must be defined');

  // TODO: this requires a second transaction to convert the cash...
  // TODO: alternatively, we can use ConvertCashToNToken and have a second
  // transaction for the deposit...
  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          DepositActionType.DepositUnderlyingAndMintNToken,
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
