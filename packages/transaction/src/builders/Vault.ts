import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import { PopulateTransactionInputs, populateNotionalTxnAndGas } from './common';
import {
  BASIS_POINT,
  INTERNAL_TOKEN_DECIMALS,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import {
  Registry,
  TokenBalance,
  fCashMarket,
} from '@notional-finance/core-entities';

function getVaultSlippageRate(
  debtBalance: TokenBalance,
  slippageFactor = 5 * BASIS_POINT
) {
  if (debtBalance.maturity === PRIME_CASH_VAULT_MATURITY) {
    return {
      slippageRate: 0,
      // NOTE: no fees applied here
      underlyingOut: debtBalance.neg().toUnderlying(),
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
  const { tokensOut } = pool.calculateTokenTrade(
    debtBalance.neg().unwrapVaultToken(),
    0
  );

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
        .cashBorrowed.toUnderlying();

  return {
    slippageRate,
    underlyingOut,
  };
}

export function DepositVault({
  address,
  network,
  depositBalance,
  collateralBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (!depositBalance || !collateralBalance)
    throw Error('Deposit balance, collateral balance must be defined');
  const vaultAddress = collateralBalance.vaultAddress;

  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getDepositParameters(
    address,
    collateralBalance.maturity,
    depositBalance
  );

  return populateNotionalTxnAndGas(network, address, 'enterVault', [
    address,
    vaultAddress,
    depositBalance?.n,
    collateralBalance.maturity,
    0,
    0,
    vaultData,
  ]);
}

export function EnterVault({
  address,
  network,
  depositBalance,
  debtBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (!depositBalance || debtBalance?.tokenType !== 'VaultDebt')
    throw Error('Deposit balance, debt balance must be defined');
  const vaultAddress = debtBalance.vaultAddress;

  // This must be a positive number
  const debtBalanceNum =
    debtBalance.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().neg().scaleTo(INTERNAL_TOKEN_DECIMALS)
      : debtBalance.neg().n;
  const { slippageRate: maxBorrowRate, underlyingOut } =
    getVaultSlippageRate(debtBalance);
  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity,
    underlyingOut.add(depositBalance)
  );

  return populateNotionalTxnAndGas(network, address, 'enterVault', [
    address,
    vaultAddress,
    depositBalance?.n,
    debtBalance.maturity,
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
    collateralBalance?.tokenType !== 'VaultShare' ||
    debtBalance?.tokenType !== 'VaultDebt' ||
    debtBalance?.token.vaultAddress !== collateralBalance.token.vaultAddress ||
    !collateralBalance.isNegative()
  )
    throw Error('Collateral balance, debt balance must be defined');

  const vaultAddress = collateralBalance.vaultAddress;

  let debtBalanceNum: BigNumber;
  if (debtBalance.maturity === PRIME_CASH_VAULT_MATURITY) {
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

  let minLendRate: number;
  let underlyingOut: TokenBalance;
  try {
    ({ slippageRate: minLendRate, underlyingOut } =
      getVaultSlippageRate(debtBalance));
  } catch {
    minLendRate = 0;
    underlyingOut = debtBalance.neg().toUnderlying();
  }

  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getRedeemParameters(
    address,
    collateralBalance.maturity,
    collateralBalance.neg(),
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
    debtBalance?.tokenType !== 'VaultDebt' ||
    debtBalance.maturity === undefined ||
    debtBalance.vaultAddress === undefined
  )
    throw Error('Deposit balance, debt balance must be defined');

  const vaultAddress = debtBalance.vaultAddress;
  const currentDebtBalance = accountBalances.find(
    (t) => t.tokenType === 'VaultDebt' && t.token.vaultAddress === vaultAddress
  );
  if (!currentDebtBalance) throw Error('No current vault debt');
  const { slippageRate: minLendRate, underlyingOut: costToRepay } =
    getVaultSlippageRate(currentDebtBalance?.neg());
  const { slippageRate: maxBorrowRate, underlyingOut: amountBorrowed } =
    getVaultSlippageRate(debtBalance);

  const debtBalanceNum =
    debtBalance.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().n
      : debtBalance.n;

  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity,
    amountBorrowed.add(depositBalance).sub(costToRepay)
  );

  return populateNotionalTxnAndGas(network, address, 'rollVaultPosition', [
    address,
    vaultAddress,
    debtBalanceNum,
    debtBalance.maturity,
    depositBalance?.n || TokenBalance.zero(debtBalance.underlying),
    minLendRate,
    maxBorrowRate,
    vaultData,
  ]);
}
