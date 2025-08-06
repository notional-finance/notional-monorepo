import { BigNumber, Overrides, PopulatedTransaction, ethers } from 'ethers';
import {
  PopulateTransactionInputs,
  getETHValue,
  populateNotionalTxnAndGas,
} from './common';
import {
  BASIS_POINT,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
} from '@notional-finance/util';
import {
  AccountDefinition,
  TokenBalance,
  getNetworkModel,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { NotionalV3 } from '@notional-finance/contracts';

export async function DepositVault({
  address,
  network,
  depositBalance,
  collateralBalance,
}: PopulateTransactionInputs): Promise<PopulatedTransaction> {
  if (!depositBalance || !collateralBalance)
    throw Error('Deposit balance, collateral balance must be defined');
  const vaultAddress = collateralBalance.vaultAddress;

  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);

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
  const underlyingOut = debtBalance.toUnderlying();
  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);

  const totalDeposit = profile
    ? underlyingOut.add(depositBalance)
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
    0,
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
  redeemToWETH,
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
      vaultLastUpdateTime.get(vaultAddress) || 0
    ).vaultDebt;

    // Clears the entire debt balance using max uint256
    if (maxWithdraw || vaultDebt.add(debtBalance).isZero())
      debtBalanceNum = ethers.constants.MaxUint256;
    else
      debtBalanceNum = debtBalance
        .toUnderlying()
        // Reduce the debt repaid slightly to account for slippage on vault shares.
        .mulInRatePrecision(RATE_PRECISION - 25 * BASIS_POINT)
        .scaleTo(INTERNAL_TOKEN_DECIMALS);
  } else {
    if (maxWithdraw) {
      debtBalanceNum = debtBalance.n;
    } else {
      // Reduce the debt repaid slightly to account for slippage on vault shares.
      debtBalanceNum = debtBalance.mulInRatePrecision(
        RATE_PRECISION - 25 * BASIS_POINT
      ).n;
    }
  }

  const minLendRate = 0;
  const underlyingOut = debtBalance.neg().toUnderlying();

  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);
  const vaultData = await vaultAdapter.getRedeemParameters(
    address,
    collateralBalance.maturity,
    collateralBalance.neg(),
    underlyingOut
  );

  const args: Parameters<NotionalV3['functions']['exitVault']> = [
    address,
    vaultAddress,
    address, // Receiver
    collateralBalance.neg().n, // vault shares to redeem
    debtBalanceNum,
    minLendRate,
    vaultData,
  ];

  if (redeemToWETH) {
    args.push({
      type: 1,
      accessList: [
        {
          address,
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        },
        network === Network.arbitrum
          ? {
              // Safe L2 Singleton
              address: '0x29fcb43b46531bca003ddc8fcb67ffe91900c762',
              // Fallback Handler Storage Key
              storageKeys: [
                '0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5',
              ],
            }
          : {
              // Mainnet Singleton (is this correct?)
              address: '0x6851d6fdfafd08c0295c392436245e5bc78b0185',
              storageKeys: [
                '0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5',
              ],
            },
      ],
    } as Overrides);
  }

  return populateNotionalTxnAndGas(network, address, 'exitVault', args);
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
  if (!vaultLastUpdateTime.has(vaultAddress))
    throw Error('Vault last update time not found');

  const profile = new VaultAccountRiskProfile(
    vaultAddress,
    accountBalances,
    vaultLastUpdateTime.get(vaultAddress) || 0
  );

  const currentDebtBalance = profile.vaultDebt;
  const costToRepay = currentDebtBalance?.neg().toUnderlying();
  const amountBorrowed = debtBalance.toUnderlying();

  // NOTE: this has to be scaled to internal token decimals
  const debtBalanceNum =
    debtBalance.maturity === PRIME_CASH_VAULT_MATURITY
      ? debtBalance.toUnderlying().neg().scaleTo(INTERNAL_TOKEN_DECIMALS)
      : debtBalance.neg().n;

  const vaultAdapter = getNetworkModel(network).getVaultAdapter(vaultAddress);

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
    0,
    0,
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
