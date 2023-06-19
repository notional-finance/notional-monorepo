import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import {
  PopulateTransactionInputs,
  getVaultSlippageRate,
  populateNotionalTxnAndGas,
} from './common';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { TokenBalance } from '@notional-finance/core-entities';

export function EnterVault({
  address,
  network,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    !depositBalance ||
    debtBalance?.token.tokenType !== 'VaultDebt' ||
    debtBalance.token.maturity === undefined ||
    debtBalance.token.vaultAddress === undefined
  )
    throw Error('Deposit balance, debt balance must be defined');
  const vaultAddress = debtBalance.token.vaultAddress;

  // TODO: calculate vault data in here
  const debtBalanceNum =
    debtBalance.token.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().n
      : debtBalance.n;
  const maxBorrowRate = getVaultSlippageRate(debtBalance);
  const vaultData = vaultAdapter.getDepositParameters(
    depositBalance,
    debtBalance
  );

  return populateNotionalTxnAndGas(network, address, 'enterVault', [
    address,
    vaultAddress,
    depositBalance?.n,
    debtBalance.token.maturity,
    debtBalanceNum,
    maxBorrowRate,
    vaultData,
  ]);
}

export function ExitVault({
  address,
  network,
  collateralBalance,
  debtBalance,
  accountBalances,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    collateralBalance?.token.tokenType !== 'VaultShare' ||
    collateralBalance.token.vaultAddress === undefined ||
    debtBalance?.token.vaultAddress !== collateralBalance.token.vaultAddress ||
    collateralBalance.isNegative()
  )
    throw Error('Collateral balance, debt balance must be defined');

  const vaultAddress = collateralBalance.token.vaultAddress;

  let debtBalanceNum: BigNumber;
  if (debtBalance.token.maturity === PRIME_CASH_VAULT_MATURITY) {
    const matchingBalance = accountBalances.find(
      (t) => t.tokenId === debtBalance.tokenId
    );
    // TODO: this might happen during settlement....
    if (!matchingBalance) throw Error('matching prime debt not found');

    // Clears the entire debt balance using max uint256
    if (matchingBalance.add(debtBalance).isZero())
      debtBalanceNum = ethers.constants.MaxUint256;
    else debtBalanceNum = debtBalance.toUnderlying().n;
  } else {
    debtBalanceNum = debtBalance.n;
  }
  const minLendRate = getVaultSlippageRate(debtBalance.neg());
  const vaultData = vaultAdapter.getRedeemParameters(
    collateralBalance,
    debtBalance
  );

  return populateNotionalTxnAndGas(network, address, 'exitVault', [
    address,
    vaultAddress,
    address, // Receiver
    collateralBalance.neg().n, // vault shares to redeem
    debtBalanceNum,
    minLendRate,
    vaultData,
  ]);
}

export function RollVault({
  address,
  network,
  depositBalance,
  debtBalance,
  accountBalances,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    !depositBalance ||
    debtBalance?.token.tokenType !== 'VaultDebt' ||
    debtBalance.token.maturity === undefined ||
    debtBalance.token.vaultAddress === undefined
  )
    throw Error('Deposit balance, debt balance and vault data must be defined');

  const vaultAddress = debtBalance.token.vaultAddress;
  const currentDebtBalance = accountBalances.find(
    (t) =>
      t.token.tokenType === 'VaultDebt' && t.token.vaultAddress === vaultAddress
  );
  if (!currentDebtBalance) throw Error('No current vault debt');
  const minLendRate = getVaultSlippageRate(currentDebtBalance?.neg());
  const maxBorrowRate = getVaultSlippageRate(debtBalance);

  const debtBalanceNum =
    debtBalance.token.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().n
      : debtBalance.n;

  const vaultData = vaultAdapter.getDepositParameters(
    depositBalance,
    debtBalance,
    currentDebtBalance
  );

  return populateNotionalTxnAndGas(network, address, 'rollVaultPosition', [
    address,
    vaultAddress,
    debtBalanceNum,
    debtBalance.token.maturity,
    depositBalance?.n || TokenBalance.zero(debtBalance.underlying),
    minLendRate,
    maxBorrowRate,
    vaultData,
  ]);
}
