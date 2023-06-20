import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import { PopulateTransactionInputs, populateNotionalTxnAndGas } from './common';
import { BASIS_POINT, PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import {
  Registry,
  TokenBalance,
  fCashMarket,
} from '@notional-finance/core-entities';

function getVaultSlippageRate(
  debtBalance: TokenBalance,
  slippageFactor = 5 * BASIS_POINT
) {
  if (debtBalance.token.maturity === PRIME_CASH_VAULT_MATURITY) {
    return {
      slippageRate: 0,
      // NOTE: no fees applied here
      underlyingOut: debtBalance.toUnderlying(),
    };
  }

  const nToken = Registry.getTokenRegistry().getNToken(
    debtBalance.network,
    debtBalance.currencyId
  );
  const pool = Registry.getExchangeRegistry().getPoolInstance<fCashMarket>(
    debtBalance.network,
    nToken.address
  );

  const slippageRate = pool.getSlippageRate(
    debtBalance.unwrapVaultToken(),
    slippageFactor
  );
  const { tokensOut } = pool.calculateTokenTrade(debtBalance, 0);

  const underlyingOut = debtBalance.isPositive()
    ? // If lending, no fees are applied on the vault side
      tokensOut.toUnderlying()
    : // If borrowing, fees are applied on the vault side
      Registry.getConfigurationRegistry()
        .getVaultBorrowWithFees(
          debtBalance.network,
          debtBalance.vaultAddress,
          debtBalance.maturity,
          tokensOut
        )
        .toUnderlying();

  return {
    slippageRate,
    underlyingOut,
  };
}

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

  const debtBalanceNum =
    debtBalance.token.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().n
      : debtBalance.n;
  const { slippageRate: maxBorrowRate, underlyingOut } =
    getVaultSlippageRate(debtBalance);
  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getDepositParameters(
    address,
    debtBalance.token.maturity,
    underlyingOut.add(depositBalance)
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
    collateralBalance.token.maturity === undefined ||
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

  const { slippageRate: minLendRate, underlyingOut } = getVaultSlippageRate(
    debtBalance.neg()
  );

  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getRedeemParameters(
    address,
    collateralBalance.token.maturity,
    collateralBalance,
    underlyingOut
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
    throw Error('Deposit balance, debt balance must be defined');

  const vaultAddress = debtBalance.token.vaultAddress;
  const currentDebtBalance = accountBalances.find(
    (t) =>
      t.token.tokenType === 'VaultDebt' && t.token.vaultAddress === vaultAddress
  );
  if (!currentDebtBalance) throw Error('No current vault debt');
  const { slippageRate: minLendRate, underlyingOut: costToRepay } =
    getVaultSlippageRate(currentDebtBalance?.neg());
  const { slippageRate: maxBorrowRate, underlyingOut: amountBorrowed } =
    getVaultSlippageRate(debtBalance);

  const debtBalanceNum =
    debtBalance.token.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().n
      : debtBalance.n;

  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getDepositParameters(
    address,
    debtBalance.token.maturity,
    amountBorrowed.add(depositBalance).sub(costToRepay)
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
