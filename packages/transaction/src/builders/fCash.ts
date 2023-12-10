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
import {
  ConvertCashToNToken,
  ConvertfCashToNToken,
  MintNToken,
  RedeemAndWithdrawNToken,
  RedeemToPortfolioNToken,
} from './nToken';
import {
  BASIS_POINT,
  RATE_PRECISION,
  MAX_UINT88,
} from '@notional-finance/util';
import { DeleverageNToken } from './Leveraged';
import { TokenBalance } from '@notional-finance/core-entities';

export function LendFixed({
  address,
  network,
  collateralBalance,
  depositBalance,
  redeemToWETH,
  accountBalances,
  maxWithdraw,
}: PopulateTransactionInputs) {
  if (!collateralBalance) throw Error('Collateral balance undefined');
  if (!depositBalance) throw Error('Deposit balance undefined');

  const { withdrawEntireCashBalance, cashBalance } = hasExistingCashBalance(
    collateralBalance,
    accountBalances
  );

  if (
    (!!cashBalance && !cashBalance.isZero()) ||
    collateralBalance.underlying.symbol === 'ETH'
  ) {
    // De-Rate the fCash balance by a dust amount to ensure that the txn goes
    // through. fCash gets more expensive as you get closer to maturity. We want
    // to ensure that the fCash amount defined here is good for a few hours at least.
    //  exchangeRate = e ^ ((rate * timeToMaturity) / SECONDS_IN_YEAR)
    //    assuming that the rate does not change:
    //  exchangeRateRatio = exchangeRateAtSubmit / exchangeRateAtConfirmation
    //  exchangeRateRatio = e^ [ timeToConfirmation / SECONDS_IN_YEAR ]
    //  if timeToConfirmation = 2 hours (bad case assumption):
    //    e ^ -(3600 * 2 / SECONDS_IN_YEAR) ~ 0.9997

    // NOTE: if "maxWithdraw" is specified then use the full collateral balance since this would
    // represent a full repayment and we do not want to de-rate the fCash balance at all.
    collateralBalance = maxWithdraw
      ? collateralBalance
      : collateralBalance.scale(
          RATE_PRECISION - BASIS_POINT * 3,
          RATE_PRECISION
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
  } else {
    // If there is no cash balance then can use a batchLend
    return populateNotionalTxnAndGas(network, address, 'batchLend', [
      address,
      [getBatchLend([collateralBalance])],
    ]);
  }
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
  debtBalance,
  accountBalances,
  redeemToWETH,
}: PopulateTransactionInputs) {
  if (!debtBalance) throw Error('Debt balance must be defined');

  // NOTE: this returns the direct FX'd prime cash amount which is probably wrong....
  const { withdrawEntireCashBalance, withdrawAmountInternalPrecision } =
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
  const { withdrawEntireCashBalance } = hasExistingCashBalance(
    debtBalance,
    accountBalances
  );
  if (!withdrawEntireCashBalance) throw Error('Unimplemented');

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
          undefined,
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
  maxWithdraw,
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
      maxWithdraw,
    });
  } else {
    const { cashBalance } = hasExistingCashBalance(
      depositBalance.toPrimeCash(),
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
  redeemToWETH,
  accountBalances,
  maxWithdraw,
}: PopulateTransactionInputs) {
  if (!debtBalance)
    throw Error('Collateral and deposit balances must be defined');

  const { withdrawEntireCashBalance, withdrawAmountInternalPrecision } =
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
        maxWithdraw ? MAX_UINT88 : debtBalance.toPrimeCash().neg().n,
        !redeemToWETH,
      ]);
}

export function RollLendOrDebt({
  address,
  network,
  debtBalance,
  collateralBalance,
  accountBalances,
  maxWithdraw,
}: PopulateTransactionInputs) {
  if (!collateralBalance || !debtBalance)
    throw Error('Debt and Collateral Balances must be defined');
  if (
    (collateralBalance.isNegative() && debtBalance.isNegative()) ||
    (collateralBalance.isPositive() && debtBalance.isPositive())
  )
    throw Error('Debt and Collateral Balances positive and negative signed');

  let { withdrawEntireCashBalance } = hasExistingCashBalance(
    debtBalance.toPrimeCash(),
    accountBalances
  );

  // Withdraw the entire cash balance when converting into or out of prime cash
  // and we are attempting to convert the entire balance so that all dust is
  // cleared. If there is no cash balance and we are converting between fCash or
  // nTokens then cash will be withdrawn if there is no prior cash balance to maintain
  // a zero cash balance.
  withdrawEntireCashBalance =
    withdrawEntireCashBalance ||
    (maxWithdraw &&
      (collateralBalance.tokenType === 'PrimeCash' ||
        debtBalance.tokenType === 'PrimeDebt'));

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
          withdrawEntireCashBalance,
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

export async function Deposit(i: PopulateTransactionInputs) {
  if (i.collateralBalance?.tokenType === 'fCash') {
    return LendFixed(i);
  } else if (i.collateralBalance?.tokenType === 'nToken') {
    return MintNToken(i);
  } else if (i.collateralBalance?.tokenType === 'PrimeCash') {
    return LendVariable(i);
  }

  throw Error('Invalid collateral balance');
}

export async function Withdraw(i: PopulateTransactionInputs) {
  if (
    i.debtBalance?.tokenType === 'fCash' ||
    i.debtBalance?.tokenType === 'PrimeDebt'
  ) {
    return WithdrawLend(i);
  } else if (i.debtBalance?.tokenType === 'nToken') {
    return RedeemAndWithdrawNToken(i);
  }

  throw Error('Invalid debt balance');
}

export function ConvertAsset(i: PopulateTransactionInputs) {
  if (
    (i.debtBalance?.tokenType === 'fCash' ||
      i.debtBalance?.tokenType === 'PrimeDebt') &&
    (i.collateralBalance?.tokenType === 'fCash' ||
      i.collateralBalance?.tokenType === 'PrimeCash')
  ) {
    return RollLendOrDebt(i);
  } else if (
    i.debtBalance?.tokenType === 'nToken' &&
    i.collateralBalance?.tokenType === 'fCash'
  ) {
    // This is the same action as redeeming to portfolio and lending
    return DeleverageNToken(i);
  } else if (
    i.debtBalance?.tokenType === 'fCash' &&
    i.collateralBalance?.tokenType === 'nToken'
  ) {
    return ConvertfCashToNToken(i);
  } else if (
    i.debtBalance?.tokenType === 'nToken' &&
    i.collateralBalance?.tokenType === 'PrimeCash'
  ) {
    return RedeemToPortfolioNToken(i);
  } else if (
    i.debtBalance?.tokenType === 'PrimeDebt' &&
    i.collateralBalance?.tokenType === 'nToken'
  ) {
    return ConvertCashToNToken(i);
  }

  throw Error('Invalid debt balance');
}
