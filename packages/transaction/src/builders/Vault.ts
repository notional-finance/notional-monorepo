import { PopulatedTransaction, ethers } from 'ethers';
import {
  PopulateTransactionInputs,
  populateLendingRouterTxnAndGas,
} from './common';
import {
  AccountDefinition,
  getNetworkModel,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';

export async function EnterVault({
  address,
  network,
  depositBalance,
  debtBalance,
  accountBalances,
  vaultLastUpdateTime,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (!depositBalance || debtBalance?.tokenType !== 'VaultDebt')
    throw Error('Deposit balance, debt balance must be defined');
  const vaultAddress = debtBalance.vaultAddress;
  const lendingRouter = debtBalance.token.address;

  const profile =
    accountBalances && vaultLastUpdateTime
      ? VaultAccountRiskProfile.fromAccount(vaultAddress, {
          balances: accountBalances,
          vaultLastUpdateTime,
        } as AccountDefinition)
      : undefined;

  // This must be a positive number
  const borrowAmount = debtBalance.neg().toUnderlying();
  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const totalDeposit = profile
    ? borrowAmount.add(depositBalance)
    : borrowAmount.add(depositBalance);

  const vaultData = await vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity || 0,
    totalDeposit
  );

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
  const assetToRepay = debtBalance.neg().toUnderlying();
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
    debtBalance.isNegative() ||
    vaultLastUpdateTime === undefined
  )
    throw Error('Collateral balance, debt balance must be defined');
  const vaultAddress = collateralBalance.vaultAddress;
  const lendingRouter = debtBalance.token.address;
  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const vaultData = await vaultAdapter.getWithdrawParameters(
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
