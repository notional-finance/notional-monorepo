import { TokenBalance } from '@notional-finance/core-entities';
import {
  DepositActionType,
  getBalanceAction,
  getBalanceAndTradeAction,
  getBatchLend,
  getETHValue,
  hasExistingCashBalance,
  populateNotionalTxnAndGas,
  PopulateTransactionInputs,
} from './common';

export function LendFixed({
  address,
  network,
  collateralBalance,
  depositBalance,
  redeemToWETH,
  accountBalances,
}: PopulateTransactionInputs) {
  if (!collateralBalance) throw Error('Collateral balance undefined');

  if (collateralBalance.underlying.symbol === 'ETH') {
    if (depositBalance?.token.symbol !== 'ETH')
      throw Error('Must specify ETH depositBalance');

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
            DepositActionType.DepositUnderlying,
            depositBalance,
            withdrawEntireCashBalance,
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

export function BorrowVariable({
  address,
  network,
  debtBalance,
  redeemToWETH,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('Deposit balance undefined');

  return populateNotionalTxnAndGas(network, address, 'withdraw', [
    debtBalance.currencyId,
    debtBalance?.toPrimeCash().abs().n,
    redeemToWETH ? false : true,
  ]);
}

export function BorrowFixed({
  address,
  network,
  depositBalance,
  debtBalance,
  accountBalances,
  redeemToWETH,
}: PopulateTransactionInputs) {
  if (!depositBalance || !debtBalance)
    throw Error('All balances must be defined');

  // NOTE: this returns the direct FX'd prime cash amount which is probably wrong....
  const { withdrawAmountInternalPrecision, withdrawEntireCashBalance } =
    hasExistingCashBalance(debtBalance, accountBalances);

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          DepositActionType.None,
          TokenBalance.zero(debtBalance.underlying),
          withdrawEntireCashBalance,
          withdrawAmountInternalPrecision,
          redeemToWETH,
          debtBalance.tokenType === 'fCash' ? [debtBalance] : []
        ),
      ].sort((a, b) => (a.currencyId as number) - (b.currencyId as number)),
      getETHValue(depositBalance),
    ]
  );
}

export function BorrowWithCollateral({
  address,
  network,
  collateralBalance,
  depositBalance,
  debtBalance,
  redeemToWETH,
  accountBalances,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !depositBalance || !debtBalance)
    throw Error('All balances must be defined');

  const { cashBalance: collateralCash } = hasExistingCashBalance(
    collateralBalance,
    accountBalances
  );

  // NOTE: this returns the direct FX'd prime cash amount which is probably wrong....
  const { withdrawAmountInternalPrecision, withdrawEntireCashBalance } =
    hasExistingCashBalance(debtBalance, accountBalances);

  return populateNotionalTxnAndGas(
    network,
    address,
    'batchBalanceAndTradeAction',
    [
      address,
      [
        getBalanceAndTradeAction(
          collateralBalance.tokenType === 'nToken'
            ? DepositActionType.DepositUnderlyingAndMintNToken
            : DepositActionType.DepositUnderlying,
          depositBalance,
          // If the account has collateral cash or is depositing prime cash collateral, then
          // do not withdraw cash balances. Otherwise, withdraw residuals.
          collateralCash || collateralBalance.tokenType === 'PrimeCash'
            ? false
            : true,
          undefined,
          redeemToWETH,
          collateralBalance.tokenType === 'fCash' ? [collateralBalance] : []
        ),
        getBalanceAndTradeAction(
          DepositActionType.None,
          TokenBalance.zero(debtBalance.underlying),
          withdrawEntireCashBalance,
          withdrawAmountInternalPrecision,
          redeemToWETH,
          debtBalance.tokenType === 'fCash' ? [debtBalance] : []
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
  accountBalances,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !depositBalance)
    throw Error('Collateral and deposit balances must be defined');

  if (collateralBalance.tokenType === 'fCash') {
    return LendFixed({
      address,
      network,
      collateralBalance,
      depositBalance,
      redeemToWETH,
      accountBalances,
    });
  } else {
    const { cashBalance } = hasExistingCashBalance(
      depositBalance,
      accountBalances
    );
    if (!cashBalance?.isNegative()) throw Error('Must have cash debt to repay');

    return populateNotionalTxnAndGas(network, address, 'batchBalanceAction', [
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
}

export function WithdrawLend({
  address,
  network,
  debtBalance,
  depositBalance,
  redeemToWETH,
  accountBalances,
}: PopulateTransactionInputs) {
  if (!debtBalance || !depositBalance)
    throw Error('Collateral and deposit balances must be defined');

  const { withdrawAmountInternalPrecision, withdrawEntireCashBalance } =
    hasExistingCashBalance(debtBalance, accountBalances);

  return debtBalance.tokenType === 'fCash'
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
              withdrawEntireCashBalance,
              withdrawAmountInternalPrecision,
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
            (t) => t.tokenType === 'fCash'
          )
        ),
      ],
    ]
  );
}
