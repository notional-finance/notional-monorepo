import { ILendingRouter, LendingRouterABI } from '@notional-finance/contracts';
import { BigNumber, Contract, PayableOverrides } from 'ethers';
import {
  getProviderFromNetwork,
  IS_TEST_ENV,
  Network,
} from '@notional-finance/util';
import { TokenBalance } from '@notional-finance/core-entities';
import { simulateOnTenderly } from '../simulate';

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
  withdrawTokensBurned?: TokenBalance[];
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

  try {
    if (!IS_TEST_ENV) {
      // NOTE: this fails inside unit tests for some reason
      const gasLimit = await c.estimateGas[methodName].apply(c, methodArgs);
      // Add 5% to the estimated gas limit to reduce the risk of out of gas errors
      txn.gasLimit = gasLimit.add(gasLimit.mul(gasBufferPercent).div(100));
    }
  } catch (e) {
    const apiKey = process.env['NX_TENDERLY_API_KEY'];
    const account = process.env['NX_TENDERLY_ACCOUNT'];
    const project = process.env['NX_TENDERLY_PROJECT'];
    if (apiKey && account && project) {
      // If gas estimation fails then we get an error here.
      const resp = await simulateOnTenderly(
        Network.mainnet,
        txn,
        process.env['NX_TENDERLY_API_KEY'] as string,
        process.env['NX_TENDERLY_ACCOUNT'] as string,
        process.env['NX_TENDERLY_PROJECT'] as string
      );

      console.error(
        `Tenderly Simulation URL: https://dashboard.tenderly.co/${account}/${project}/simulator/${resp.simulation.id}`
      );
    }
    throw e;
  }

  return txn;
}

export async function populateLendingRouterTxnAndGas<
  M extends keyof ILendingRouter['functions']
>(
  network: Network,
  msgSender: string,
  lendingRouter: string,
  methodName: M,
  methodArgs: Parameters<ILendingRouter['functions'][M]>,
  gasBufferPercent = 5
) {
  const contract = new Contract(
    lendingRouter,
    LendingRouterABI,
    getProviderFromNetwork(network)
  ) as ILendingRouter;

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
