import { BigNumber, PopulatedTransaction, ethers } from 'ethers';
import {
  PopulateTransactionInputs,
  getETHValue,
  populateNotionalTxnAndGas,
} from './common';
import {
  BASIS_POINT,
  INTERNAL_TOKEN_DECIMALS,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
} from '@notional-finance/util';
import {
  AccountDefinition,
  Registry,
  TokenBalance,
  fCashMarket,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';

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

export async function DepositVault({
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

  const vaultData = await vaultAdapter.getDepositParameters(
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

  const profile =
    accountBalances && vaultLastUpdateTime
      ? VaultAccountRiskProfile.fromAccount(vaultAddress, {
          balances: accountBalances,
          vaultLastUpdateTime,
        } as AccountDefinition)
      : undefined;

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

  const totalDeposit = profile
    ? underlyingOut
        .sub(profile.accruedVaultFees.toUnderlying())
        .add(depositBalance)
    : underlyingOut.add(depositBalance);
  const vaultData = await vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity,
    totalDeposit
  );

  return populateNotionalTxnAndGas(network, address, 'enterVault', [
    address,
    vaultAddress,
    depositBalance?.n,
    debtBalance.maturity,
    debtBalanceNum,
    maxBorrowRate,
    vaultData,
    getETHValue(depositBalance),
  ]);
}

export async function ExitVault({
  address,
  network,
  collateralBalance,
  debtBalance,
  accountBalances,
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

  let debtBalanceNum: BigNumber;
  if (debtBalance.maturity === PRIME_CASH_VAULT_MATURITY) {
    const vaultDebt = new VaultAccountRiskProfile(
      vaultAddress,
      accountBalances,
      vaultLastUpdateTime[vaultAddress] || 0
    ).vaultDebt;

    // Clears the entire debt balance using max uint256
    if (maxWithdraw || vaultDebt.add(debtBalance).isZero())
      debtBalanceNum = ethers.constants.MaxUint256;
    else
      debtBalanceNum = debtBalance
        .toUnderlying()
        .scaleTo(INTERNAL_TOKEN_DECIMALS);
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

  const vaultData = await vaultAdapter.getRedeemParameters(
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

export async function RollVault({
  address,
  network,
  depositBalance,
  debtBalance,
  accountBalances,
  vaultLastUpdateTime,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (
    !depositBalance ||
    debtBalance?.tokenType !== 'VaultDebt' ||
    debtBalance.maturity === undefined ||
    debtBalance.vaultAddress === undefined ||
    vaultLastUpdateTime === undefined
  )
    throw Error('Deposit balance, debt balance must be defined');

  const vaultAddress = debtBalance.vaultAddress;
  if (vaultLastUpdateTime[vaultAddress] === undefined)
    throw Error('Vault last update time not found');

  const profile = new VaultAccountRiskProfile(
    vaultAddress,
    accountBalances,
    vaultLastUpdateTime[vaultAddress]
  );

  const currentDebtBalance = profile.vaultDebt.sub(profile.accruedVaultFees);
  const { slippageRate: minLendRate, underlyingOut: costToRepay } =
    getVaultSlippageRate(currentDebtBalance?.neg());
  const { slippageRate: maxBorrowRate, underlyingOut: amountBorrowed } =
    getVaultSlippageRate(debtBalance);

  // NOTE: this has to be scaled to internal token decimals
  const debtBalanceNum =
    debtBalance.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().neg().scaleTo(INTERNAL_TOKEN_DECIMALS)
      : debtBalance.neg().n;

  const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
    network,
    vaultAddress
  );

  const vaultData = await vaultAdapter.getDepositParameters(
    address,
    debtBalance.maturity,
    amountBorrowed.add(depositBalance).add(costToRepay)
  );

  return populateNotionalTxnAndGas(network, address, 'rollVaultPosition', [
    address,
    vaultAddress,
    // Scale up the debt balance slightly to ensure that the transaction goes through
    debtBalanceNum.mul(RATE_PRECISION + 0.1 * BASIS_POINT).div(RATE_PRECISION),
    debtBalance.maturity,
    depositBalance?.n || TokenBalance.zero(debtBalance.underlying),
    minLendRate,
    maxBorrowRate,
    vaultData,
    getETHValue(depositBalance),
  ]);
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
