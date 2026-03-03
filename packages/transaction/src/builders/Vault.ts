import { PopulatedTransaction, ethers } from 'ethers';
import {
  PopulateTransactionInputs,
  populateLendingRouterTxnAndGas,
} from './common';
import { getNetworkModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';

export async function EnterVault({
  address,
  network,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (!depositBalance || debtBalance?.tokenType !== 'VaultDebt')
    throw Error('Deposit balance, debt balance must be defined');
  const vaultAddress = debtBalance.vaultAddress;
  const lendingRouter = debtBalance.token.address;

  // This must be a positive number
  const borrowAmount = debtBalance.neg().toUnderlying();
  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const totalDeposit = borrowAmount.add(depositBalance);
  const allocations = getNetworkModel(network)
    .getLendingMarketFromVaultDebt(debtBalance.token)
    .getAllocationData(undefined, debtBalance.neg());

  const vaultData = await vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity || 0,
    totalDeposit
  );

  // TODO: check if deposit token is the yield token

  if (allocations) {
    return populateLendingRouterTxnAndGas(
      network,
      address,
      lendingRouter,
      'allocateAndEnterPosition',
      [
        address,
        vaultAddress,
        depositBalance.n,
        borrowAmount.n,
        vaultData,
        allocations,
      ]
    );
  }

  return populateLendingRouterTxnAndGas(
    network,
    address,
    lendingRouter,
    'enterPosition',
    [address, vaultAddress, depositBalance.n, borrowAmount.n, vaultData]
  );
}

export async function ExitVault({
  address,
  network,
  collateralBalance,
  debtBalance,
  maxWithdraw,
  vaultLastUpdateTime,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    collateralBalance?.tokenType !== 'VaultShare' ||
    debtBalance?.tokenType !== 'VaultDebt' ||
    debtBalance?.token.vaultAddress !== collateralBalance.token.vaultAddress ||
    collateralBalance.isPositive() ||
    debtBalance.isNegative() ||
    vaultLastUpdateTime === undefined
  )
    throw Error('Collateral balance, debt balance must be defined');

  const vaultAddress = collateralBalance.vaultAddress;
  const lendingRouter = debtBalance.token.address;
  const assetToRepay = debtBalance.toUnderlying();
  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const vaultData = await vaultAdapter.getRedeemParameters(
    address,
    collateralBalance.maturity || 0,
    collateralBalance.neg(),
    assetToRepay
  );

  return populateLendingRouterTxnAndGas(
    network,
    address,
    lendingRouter,
    'exitPosition',
    [
      address,
      vaultAddress,
      address,
      collateralBalance.neg().n,
      maxWithdraw ? ethers.constants.MaxUint256 : assetToRepay.n,
      vaultData,
    ]
  );
}

export async function ExitVaultFinalizeWithdraw({
  address,
  network,
  collateralBalance,
  debtBalance,
  maxWithdraw,
  vaultLastUpdateTime,
  withdrawTokensBurned,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    collateralBalance?.tokenType !== 'VaultShare' ||
    debtBalance?.tokenType !== 'VaultDebt' ||
    debtBalance?.token.vaultAddress !== collateralBalance.token.vaultAddress ||
    collateralBalance.isPositive() ||
    debtBalance.isNegative() ||
    vaultLastUpdateTime === undefined ||
    withdrawTokensBurned === undefined
  )
    throw Error('Collateral balance, debt balance must be defined');

  const vaultAddress = collateralBalance.vaultAddress;
  const lendingRouter = debtBalance.token.address;
  const assetToRepay = debtBalance.toUnderlying();
  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const vaultData = await vaultAdapter.getWithdrawParameters(
    address,
    collateralBalance.neg(),
    withdrawTokensBurned
  );

  return populateLendingRouterTxnAndGas(
    network,
    address,
    lendingRouter,
    'exitPosition',
    [
      address,
      vaultAddress,
      address,
      collateralBalance.neg().n,
      maxWithdraw ? ethers.constants.MaxUint256 : assetToRepay.n,
      vaultData,
    ]
  );
}

export function AdjustLeverage(
  i: PopulateTransactionInputs
): Promise<PopulatedTransaction> {
  if (i.debtBalance?.isNegative()) {
    return EnterVault(i);
  } else if (i.debtBalance?.isPositive()) {
    return ExitVault(i);
  } else {
    throw Error('Unknown Vault Transaction');
  }
}

export function RollVault(
  _i: PopulateTransactionInputs
): Promise<PopulatedTransaction> {
  throw Error('Not implemented');
}

export async function InitiateWithdraw({
  address,
  network,
  collateralBalance,
  debtBalance,
  vaultLastUpdateTime,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    collateralBalance?.tokenType !== 'VaultShare' ||
    debtBalance?.tokenType !== 'VaultDebt' ||
    debtBalance?.token.vaultAddress !== collateralBalance.token.vaultAddress ||
    collateralBalance.isPositive() ||
    vaultLastUpdateTime === undefined
  )
    throw Error('Collateral balance, debt balance must be defined');
  const vaultAddress = collateralBalance.vaultAddress;
  const lendingRouter = debtBalance.token.address;
  const model = getNetworkModel(network);
  const vaultAdapter = model.getVaultAdapter(vaultAddress);
  const vaultData = await vaultAdapter.getInitiateWithdrawParameters(
    address,
    collateralBalance.neg()
  );

  return populateLendingRouterTxnAndGas(
    network,
    address,
    lendingRouter,
    'initiateWithdraw',
    [address, vaultAddress, vaultData]
  );
}

export async function ClaimRewards({
  address,
  network,
  lendingRouter,
  vaultAddress,
}: {
  address: string;
  network: Network;
  lendingRouter: string;
  vaultAddress: string;
}): Promise<PopulatedTransaction> {
  return populateLendingRouterTxnAndGas(
    network,
    address,
    lendingRouter,
    'claimRewards',
    [address, vaultAddress]
  );
}
