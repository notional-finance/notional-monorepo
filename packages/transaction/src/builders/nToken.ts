import {
  DepositActionType,
  getBalanceAction,
  getBalanceAndTradeAction,
  getETHValue,
  hasExistingCashBalance,
  populateNotionalTxnAndGas,
  PopulateTransactionInputs,
} from './common';

export function ClaimNOTE({ address, network }: PopulateTransactionInputs) {
  return populateNotionalTxnAndGas(
    network,
    address,
    'nTokenClaimIncentives',
    []
  );
}

export function MintNToken({
  address,
  network,
  depositBalance,
}: PopulateTransactionInputs) {
  if (!depositBalance) throw Error('depositBalance required');
  if (!depositBalance.isPositive() || depositBalance.tokenType !== 'Underlying')
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
  maxWithdraw,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('debtBalance required');
  if (debtBalance.isPositive() || debtBalance.tokenType !== 'PrimeDebt')
    throw Error('Invalid debtBalance');

  return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
    address,
    [
      getBalanceAction(
        DepositActionType.ConvertCashToNToken,
        debtBalance.toPrimeCash().neg(),
        // If doing a maxWithdraw the entire cash balance will be converted but we
        // want to clear the rounding error of 1 unit of pCash if it exists
        maxWithdraw,
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
  if (!debtBalance.isNegative() || debtBalance.tokenType !== 'nToken')
    throw Error('Invalid debtBalance');

  const { withdrawEntireCashBalance, withdrawAmountInternalPrecision } =
    hasExistingCashBalance(debtBalance, accountBalances);

  return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
    address,
    [
      getBalanceAction(
        DepositActionType.RedeemNToken,
        debtBalance.abs(),
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
  if (debtBalance.isPositive() || debtBalance.tokenType !== 'nToken')
    throw Error('Invalid debtBalance');

  return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
    address,
    [
      getBalanceAction(
        DepositActionType.RedeemNToken,
        debtBalance.neg(),
        false,
        undefined,
        false
      ),
    ],
  ]);
}

export function ConvertfCashToNToken({
  address,
  network,
  debtBalance,
  collateralBalance,
  accountBalances,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('debtBalance required');
  if (!collateralBalance || collateralBalance.tokenType !== 'nToken')
    throw Error('collateral balance required');
  if (debtBalance.isPositive() || debtBalance.tokenType !== 'fCash')
    throw Error('Invalid debtBalance');

  const { withdrawEntireCashBalance } = hasExistingCashBalance(
    debtBalance,
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
          DepositActionType.ConvertCashToNToken,
          collateralBalance.toPrimeCash(),
          withdrawEntireCashBalance, // Clear pCash balance for dust
          undefined,
          false,
          [debtBalance]
        ),
      ],
    ]
  );
}
