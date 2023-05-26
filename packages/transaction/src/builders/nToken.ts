import { TokenBalance } from '@notional-finance/core-entities';
import {
  DepositActionType,
  getBalanceAction,
  populateNotionalTxnAndGas,
} from '../common';

export function depositAndMintNToken(
  account: string,
  depositAmount: TokenBalance
) {
  return populateNotionalTxnAndGas(
    depositAmount.token.network,
    account,
    'batchBalanceAction',
    [
      account,
      [
        getBalanceAction(
          DepositActionType.DepositUnderlyingAndMintNToken,
          depositAmount,
          // no deposits or redeems here
          false,
          false
        ),
      ],
    ]
  );
}

export function convertCashToNToken(account: string, cashAmount: TokenBalance) {
  return populateNotionalTxnAndGas(
    cashAmount.token.network,
    account,
    'batchBalanceAction',
    [
      account,
      [
        getBalanceAction(
          DepositActionType.ConvertCashToNToken,
          cashAmount,
          // no deposits or redeems here
          false,
          false
        ),
      ],
    ]
  );
}

export function redeemNToken(
  account: string,
  nTokensToRedeem: TokenBalance,
  withdrawEntireCashBalance = true,
  redeemToWETH = false
) {
  return populateNotionalTxnAndGas(
    nTokensToRedeem.token.network,
    account,
    'batchBalanceAction',
    [
      account,
      [
        getBalanceAction(
          DepositActionType.RedeemNToken,
          nTokensToRedeem,
          withdrawEntireCashBalance,
          redeemToWETH
        ),
      ],
    ]
  );
}

export function redeemNTokenToCash(
  account: string,
  nTokensToRedeem: TokenBalance,
  sellTokenAssets: boolean,
  acceptResiduals: boolean
) {
  return populateNotionalTxnAndGas(
    nTokensToRedeem.token.network,
    account,
    'nTokenRedeem',
    [
      account,
      nTokensToRedeem.currencyId,
      nTokensToRedeem.n,
      sellTokenAssets,
      acceptResiduals,
    ]
  );
}
