import { BigNumber, Contract, PopulatedTransaction, ethers } from 'ethers';
import {
  PopulateTransactionInputs,
  populateLendingRouterTxnAndGas,
  populateTxnAndGas,
} from './common';
import { getNetworkModel } from '@notional-finance/core-entities';
import {
  getProviderFromNetwork,
  MorphoRouter,
  Network,
} from '@notional-finance/util';
import { Morpho, MorphoABI } from '@notional-finance/contracts';

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

  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const isEnterWithYieldToken =
    depositBalance.tokenId === vaultAdapter.yieldToken.id;
  // This must be a positive number
  const borrowAmount = debtBalance.neg().toUnderlying();
  const totalDeposit = isEnterWithYieldToken
    ? borrowAmount
    : borrowAmount.add(depositBalance);
  const allocations = getNetworkModel(network)
    .getLendingMarketFromVaultDebt(debtBalance.token)
    .getAllocationData(undefined, debtBalance.neg());

  const vaultData = await vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity || 0,
    totalDeposit
  );

  if (isEnterWithYieldToken) {
    if (allocations) {
      return populateLendingRouterTxnAndGas(
        network,
        address,
        lendingRouter,
        'allocateAndEnterPositionWithYieldTokenAndLeverage',
        [
          address,
          vaultAddress,
          depositBalance.n,
          borrowAmount.n,
          vaultData,
          allocations,
        ]
      );
    } else {
      return populateLendingRouterTxnAndGas(
        network,
        address,
        lendingRouter,
        'enterPositionWithYieldTokenAndLeverage',
        [address, vaultAddress, depositBalance.n, borrowAmount.n, vaultData]
      );
    }
  }

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

export async function RepayVault({
  address,
  network,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (!depositBalance || !debtBalance)
    throw Error('Deposit balance and debt balance must be defined');
  const morpho = new Contract(
    MorphoRouter[network],
    MorphoABI,
    getProviderFromNetwork(network)
  ) as Morpho;
  const assets = depositBalance.n;
  const marketParams = getNetworkModel(network).getMorphoMarketParams(
    depositBalance.vaultAddress,
    debtBalance.token.address
  );

  return populateTxnAndGas(morpho, address, 'repay', [
    {
      loanToken: marketParams.loanToken,
      collateralToken: marketParams.collateralToken,
      oracle: marketParams.oracle,
      irm: marketParams.irm,
      lltv: marketParams.lltv,
    },
    assets,
    BigNumber.from(0),
    address,
    '0x',
  ]);
}
