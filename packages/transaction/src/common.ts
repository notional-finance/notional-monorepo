import { NotionalV3, NotionalV3ABI } from '@notional-finance/contracts';
import { BigNumber, Contract, PopulatedTransaction } from 'ethers';
import {
  getProviderFromNetwork,
  Network,
  NotionalAddress,
} from '@notional-finance/util';
import { TokenBalance } from '@notional-finance/core-entities';
import { BalanceActionStruct } from '@notional-finance/contracts/types/NotionalV3';

export enum TradeActionType {
  Lend,
  Borrow,
  _AddLiquidity,
  _RemoveLiquidity,
  PurchaseNTokenResidual,
  _SettleCashDebt,
}

export enum DepositActionType {
  None,
  _DepositAsset,
  DepositUnderlying,
  _DepositAssetAndMintNToken,
  DepositUnderlyingAndMintNToken,
  RedeemNToken,
  ConvertCashToNToken,
}

export async function populateTxnAndGas(
  contract: Contract,
  msgSender: string,
  methodName: string,
  methodArgs: unknown[],
  gasBufferPercent = 5
) {
  const c = contract.connect(msgSender);
  // TODO: where do you get the revert reason here?
  const [txn, gasLimit]: [PopulatedTransaction, BigNumber] = await Promise.all([
    c.populateTransaction[methodName].apply(c, methodArgs),
    c.estimateGas[methodName].apply(c, methodArgs),
  ]);

  // Add 5% to the estimated gas limit to reduce the risk of out of gas errors
  txn.gasLimit = gasLimit.add(gasLimit.mul(gasBufferPercent).div(100));
  return txn;
}

export async function populateNotionalTxnAndGas<
  M extends keyof NotionalV3['functions']
>(
  network: Network,
  msgSender: string,
  methodName: M,
  methodArgs: Parameters<NotionalV3['functions'][M]>,
  gasBufferPercent = 5
) {
  const contract = new Contract(
    NotionalAddress[network],
    NotionalV3ABI,
    getProviderFromNetwork(network)
  ) as NotionalV3;

  return populateTxnAndGas(
    contract,
    msgSender,
    methodName,
    methodArgs,
    gasBufferPercent
  );
}

export async function simulatePopulatedTxn(
  network: Network,
  populateTxn: PopulatedTransaction
) {
  const provider = getProviderFromNetwork(network);
  return provider.send('alchemy_simulateAssetChanges', [
    {
      from: populateTxn.from,
      to: populateTxn.to,
      value: populateTxn.value,
      data: populateTxn.data,
    },
  ]);
}

export function getBalanceAction(
  actionType: DepositActionType,
  amount: TokenBalance,
  withdrawEntireCashBalance: boolean,
  redeemToWETH: boolean,
  withdrawAmount?: TokenBalance
): BalanceActionStruct {
  if (redeemToWETH && amount.token.symbol !== 'ETH') {
    throw Error('Cannot redeem to WETH');
  }

  if (
    (actionType === DepositActionType.DepositUnderlying ||
      actionType === DepositActionType.DepositUnderlyingAndMintNToken) &&
    amount.token.tokenType !== 'Underlying'
  ) {
    throw Error('Deposit amount has to be underlying');
  } else if (
    actionType === DepositActionType.ConvertCashToNToken &&
    amount.token.tokenType !== 'PrimeCash'
  ) {
    throw Error('Deposit amount has to be prime cash');
  } else if (
    actionType === DepositActionType.RedeemNToken &&
    amount.token.tokenType !== 'nToken'
  ) {
    throw Error('Deposit amount has to be nToken');
  }

  if (
    withdrawAmount &&
    (withdrawAmount.token.tokenType !== 'PrimeCash' ||
      withdrawAmount.token.currencyId !== amount.currencyId)
  ) {
    throw Error('Incorrect withdraw amount denomination');
  }

  const withdrawAmountInternalPrecision =
    withdrawAmount?.n || BigNumber.from(0);

  return {
    actionType,
    currencyId: amount.currencyId,
    depositActionAmount: amount.n,
    withdrawAmountInternalPrecision,
    withdrawEntireCashBalance,
    redeemToUnderlying: !redeemToWETH,
  };
}

// Simple encoders:
// encodeTrade
// getBalanceAndTradeAction
