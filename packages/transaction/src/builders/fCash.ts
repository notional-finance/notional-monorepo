import { TokenBalance } from '@notional-finance/core-entities';
import {
  DepositActionType,
  getBalanceAction,
  getBalanceAndTradeAction,
  getBatchLend,
  getETHValue,
  populateNotionalTxnAndGas,
  PopulateTransactionInputs,
} from '../common';

export function LendFixed({
  address,
  network,
  collateralBalance,
  depositBalance,
  redeemToWETH,
}: PopulateTransactionInputs) {
  if (!collateralBalance) throw Error('Collateral balance undefined');

  if (collateralBalance.underlying.symbol === 'ETH') {
    if (depositBalance?.token.symbol !== 'ETH')
      throw Error('Must specify ETH depositBalance');

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
            // TODO: manage withdraw amounts here if there are cash balances...
            true,
            undefined,
            redeemToWETH,
            [collateralBalance]
          ),
        ],
        getETHValue(depositBalance),
      ]
    );
  }

  return populateNotionalTxnAndGas(network, address, 'batchLend', [
    address,
    [getBatchLend([collateralBalance])],
  ]);
}

export function LendVariable({
  address,
  network,
  depositBalance,
}: PopulateTransactionInputs) {
  if (!depositBalance) throw Error('Deposit balance undefined');

  return populateNotionalTxnAndGas(network, address, 'depositUnderlyingToken', [
    address,
    depositBalance.currencyId,
    depositBalance.n,
    getETHValue(depositBalance),
  ]);
}

export function BorrowWithCollateral({
  address,
  network,
  collateralBalance,
  depositBalance,
  debtBalance,
  redeemToWETH,
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
          collateralBalance.token.tokenType === 'nToken'
            ? DepositActionType.DepositUnderlyingAndMintNToken
            : DepositActionType.DepositUnderlying,
          depositBalance,
          // TODO: manage withdraw balances here
          true,
          undefined,
          redeemToWETH,
          collateralBalance.token.tokenType === 'fCash'
            ? [collateralBalance]
            : []
        ),
        getBalanceAndTradeAction(
          DepositActionType.None,
          TokenBalance.zero(debtBalance.underlying),
          // TODO: manage withdraw balances here
          false,
          // NOTE: withdraw amount is specified in prime cash
          debtBalance.token.tokenType === 'PrimeDebt'
            ? debtBalance.toPrimeCash()
            : undefined,
          redeemToWETH,
          debtBalance.token.tokenType === 'fCash' ? [debtBalance] : []
        ),
      ].sort((a, b) => (a.currencyId as number) - (b.currencyId as number)),
      getETHValue(depositBalance),
    ]
  );
}

export function RepayDebt({
  address,
  network,
  collateralBalance,
  depositBalance,
  redeemToWETH,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !depositBalance)
    throw Error('Collateral and deposit balances must be defined');

  return collateralBalance.token.tokenType === 'fCash'
    ? LendFixed({
        address,
        network,
        collateralBalance,
        depositBalance,
        redeemToWETH,
      })
    : populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
        address,
        [
          getBalanceAction(
            DepositActionType.DepositUnderlying,
            depositBalance,
            // NOTE: Withdraw entire cash balance to clear the debt to zero,
            // this is always true when repaying debt otherwise should use lend
            // variable instead.
            true,
            undefined,
            redeemToWETH
          ),
        ],
        getETHValue(depositBalance),
      ]);
}

export function WithdrawLend({
  address,
  network,
  debtBalance,
  depositBalance,
  redeemToWETH,
}: PopulateTransactionInputs) {
  if (!debtBalance || !depositBalance)
    throw Error('Collateral and deposit balances must be defined');

  return debtBalance.token.tokenType === 'fCash'
    ? populateNotionalTxnAndGas(
        network,
        address,
        'batchBalanceAndTradeAction',
        [
          address,
          [
            getBalanceAndTradeAction(
              DepositActionType.None,
              TokenBalance.zero(debtBalance.underlying),
              // TODO: manage cash balances here, want to withdraw down to dust
              // balances
              false,
              depositBalance.neg(),
              redeemToWETH,
              [debtBalance]
            ),
          ],
        ]
      )
    : populateNotionalTxnAndGas(network, address, 'withdraw', [
        debtBalance.currencyId,
        // TODO: we can specify uint88 max here, this may leave some dust....
        debtBalance.neg().n,
        redeemToWETH,
      ]);
}

export function RollLendOrDebt({
  address,
  network,
  debtBalance,
  collateralBalance,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !debtBalance)
    throw Error('Debt and Collateral Balances must be defined');

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        // Has fCash asset [Borrow] => new fcash asset [Lend]
        // Has Prime Cash => new fCash asset [Lend]
        // Has fCash asset [Borrow] => Prime Cash [Hold]
        // Has fCash debt [Lend] => new fcash asset [Borrow]
        // Has fCash debt [Lend] => Prime Debt [Borrow]
        // Has Prime Debt => new fCash asset [Borrow]
        getBalanceAndTradeAction(
          DepositActionType.None,
          TokenBalance.zero(debtBalance.underlying),
          false,
          undefined,
          false,
          [debtBalance, collateralBalance].filter(
            (t) => t.token.tokenType === 'fCash'
          )
        ),
      ],
    ]
  );
}
