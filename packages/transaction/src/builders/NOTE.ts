import { Registry, SNOTEWeightedPool } from '@notional-finance/core-entities';
import { PopulateTransactionInputs, populateTxnAndGas } from './common';
import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';
import { BigNumber } from 'ethers';

export function StakeNOTE({
  address,
  collateralBalance,
  depositBalance,
  secondaryDepositBalance,
}: PopulateTransactionInputs) {
  const sNOTE = SNOTEWeightedPool.sNOTE_Contract;
  const pool = Registry.getExchangeRegistry().getSNOTEPool();
  if (
    !pool ||
    !secondaryDepositBalance ||
    !collateralBalance ||
    !depositBalance
  )
    throw Error('Inputs not defined');
  const minBPT = pool
    .getBPTForSNOTE(collateralBalance)
    .mulInRatePrecision(RATE_PRECISION - 10 * BASIS_POINT).n;

  if (depositBalance.symbol === 'WETH') {
    return populateTxnAndGas(sNOTE, address, 'mintFromWETH', [
      secondaryDepositBalance.n,
      depositBalance.n,
      minBPT,
    ]);
  } else {
    return populateTxnAndGas(sNOTE, address, 'mintFromETH', [
      secondaryDepositBalance.n,
      minBPT,
      { value: depositBalance.n },
    ]);
  }
}

export function StakeNOTECoolDown({ address }: PopulateTransactionInputs) {
  const sNOTE = SNOTEWeightedPool.sNOTE_Contract;
  return populateTxnAndGas(sNOTE, address, 'stopCoolDown', []);
}

export function StakeNOTERedeem({
  address,
  debtBalance,
  depositBalance,
}: PopulateTransactionInputs) {
  const sNOTE = SNOTEWeightedPool.sNOTE_Contract;
  if (!debtBalance || !depositBalance) throw Error('Inputs not defined');
  const minNOTE = depositBalance
    .mulInRatePrecision(RATE_PRECISION - 50 * BASIS_POINT)
    .neg().n;

  return populateTxnAndGas(sNOTE, address, 'redeem', [
    debtBalance.neg().n,
    // Never withdraw ETH from this method
    BigNumber.from(0),
    minNOTE,
    // Never withdraw ETH from this method
    false,
  ]);
}
