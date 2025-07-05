import { NotionalV3, NotionalV3ABI } from '@notional-finance/contracts';
import { BigNumber, Contract, PayableOverrides } from 'ethers';
import {
  getProviderFromNetwork,
  IS_TEST_ENV,
  Network,
  NotionalAddress,
} from '@notional-finance/util';
import { TokenBalance } from '@notional-finance/core-entities';

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

export interface PopulateTransactionInputs {
  address: string;
  network: Network;
  depositBalance?: TokenBalance;
  debtBalance?: TokenBalance;
  collateralBalance?: TokenBalance;
  redeemToWETH: boolean;
  accountBalances: TokenBalance[];
  maxWithdraw: boolean;
  secondaryDepositBalance?: TokenBalance;
  vaultLastUpdateTime?: Map<string, number>;
  tradeType?: string;
  ethRedeem?: TokenBalance;
}

export async function populateTxnAndGas(
  contract: Contract,
  msgSender: string,
  methodName: string,
  methodArgs: unknown[],
  gasBufferPercent = 5
) {
  const c = contract.connect(msgSender);
  const txn = await c.populateTransaction[methodName].apply(c, methodArgs);
  if (!IS_TEST_ENV) {
    // NOTE: this fails inside unit tests for some reason
    const gasLimit = await c.estimateGas[methodName].apply(c, methodArgs);
    // Add 5% to the estimated gas limit to reduce the risk of out of gas errors
    txn.gasLimit = gasLimit.add(gasLimit.mul(gasBufferPercent).div(100));
  }

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

export function getETHValue(balance?: TokenBalance): PayableOverrides {
  return {
    value: balance?.token.symbol === 'ETH' ? balance.n : BigNumber.from(0),
  };
}
