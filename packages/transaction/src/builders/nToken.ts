import {
  DepositActionType,
  getBalanceAction,
  getETHValue,
  hasExistingCashBalance,
  populateNotionalTxnAndGas,
  PopulateTransactionInputs,
} from './common';

export function MintNToken({
  address,
  network,
  depositBalance,
}: PopulateTransactionInputs) {
  if (!depositBalance) throw Error('depositBalance required');
  if (
    !depositBalance.isPositive() ||
    depositBalance.token.tokenType !== 'Underlying'
  )
    throw Error('Invalid deposit balance');

  return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
    address,
    [
      getBalanceAction(
        DepositActionType.DepositUnderlyingAndMintNToken,
        depositBalance,
        // no deposits or redeems here
        false,
        undefined,
        false
      ),
    ],
    getETHValue(depositBalance),
  ]);
}

export function ConvertCashToNToken({
  address,
  network,
  debtBalance,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('debtBalance required');
  // Debt balance should be in positive prime cash
  if (!debtBalance.isPositive() || debtBalance.token.tokenType !== 'PrimeCash')
    throw Error('Invalid debtBalance');

  return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
    address,
    [
      getBalanceAction(
        DepositActionType.ConvertCashToNToken,
        debtBalance,
        // no deposits or redeems here
        false,
        undefined,
        false
      ),
    ],
  ]);
}

export function RedeemAndWithdrawNToken({
  address,
  network,
  debtBalance,
  redeemToWETH,
  accountBalances,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('debtBalance required');
  if (!debtBalance.isPositive() || debtBalance.token.tokenType !== 'nToken')
    throw Error('Invalid debtBalance');

  // TODO: these values do not include slippage.
  const { withdrawEntireCashBalance, withdrawAmountInternalPrecision } =
    hasExistingCashBalance(debtBalance, accountBalances);

  return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
    address,
    [
      getBalanceAction(
        DepositActionType.RedeemNToken,
        debtBalance,
        withdrawEntireCashBalance,
        withdrawAmountInternalPrecision,
        redeemToWETH
      ),
    ],
  ]);
}

export function RedeemToPortfolioNToken({
  address,
  network,
  debtBalance,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('debtBalance required');
  if (!debtBalance.isPositive() || debtBalance.token.tokenType !== 'nToken')
    throw Error('Invalid debtBalance');

  return populateNotionalTxnAndGas(network, address, 'nTokenRedeem', [
    address,
    debtBalance.currencyId,
    debtBalance.n,
    true, // sell assets
    true, // accept residuals
  ]);
}
