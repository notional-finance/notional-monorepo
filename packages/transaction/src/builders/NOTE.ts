import { Registry, SNOTEWeightedPool } from '@notional-finance/core-entities';
import { PopulateTransactionInputs, populateTxnAndGas } from './common';
import {
  BASIS_POINT,
  Network,
  RATE_PRECISION,
  getProviderFromNetwork,
} from '@notional-finance/util';

export function StakeNOTE({
  address,
  collateralBalance,
  depositBalance,
  secondaryDepositBalance,
}: PopulateTransactionInputs) {
  const sNOTE = SNOTEWeightedPool.sNOTE_Contract.connect(
    getProviderFromNetwork(Network.mainnet)
  );
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
  collateralBalance,
  depositBalance,
  ethRedeem,
}: PopulateTransactionInputs) {
  const sNOTE = SNOTEWeightedPool.sNOTE_Contract.connect(
    getProviderFromNetwork(Network.mainnet)
  );
  if (!collateralBalance || !ethRedeem || !depositBalance)
    throw Error('Inputs not defined');
  const minETH = ethRedeem.mulInRatePrecision(
    RATE_PRECISION - 50 * BASIS_POINT
  ).n;
  const minNOTE = collateralBalance.mulInRatePrecision(
    RATE_PRECISION - 50 * BASIS_POINT
  ).n;

  return populateTxnAndGas(sNOTE, address, 'redeem', [
    depositBalance.n,
    minETH,
    minNOTE,
    // Returns the native ETH
    true,
  ]);
}
