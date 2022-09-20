import { BigNumber } from 'ethers';
import { TypedBigNumber, BigNumberType } from '../../src';
import { BASIS_POINT, SECONDS_IN_QUARTER } from '../../src/config/constants';
import { VaultState, VaultConfig } from '../../src/data';
import CrossCurrencyfCash from '../../src/vaults/strategy/CrossCurrencyfCash';

export function MockCrossCurrencyConfig(maturity: number) {
  const vaultSymbol = `0xabc:${maturity}`;
  const vaultSymbolSettled = `0xabc:${maturity - SECONDS_IN_QUARTER}`;

  const vaultState1: VaultState = {
    maturity,
    isSettled: false,
    totalPrimaryfCashBorrowed: TypedBigNumber.fromBalance(-100_000e8, 'DAI', true),
    totalAssetCash: TypedBigNumber.fromBalance(0, 'cDAI', true),
    totalVaultShares: TypedBigNumber.from(100_000e8, BigNumberType.VaultShare, vaultSymbol),
    totalStrategyTokens: TypedBigNumber.from(100_000e8, BigNumberType.StrategyToken, vaultSymbol),
  } as unknown as VaultState;

  const vaultStateSettled: VaultState = {
    maturity: maturity - SECONDS_IN_QUARTER,
    isSettled: true,
    totalPrimaryfCashBorrowed: TypedBigNumber.fromBalance(-100_000e8, 'DAI', true),
    totalAssetCash: TypedBigNumber.fromBalance(5_100_000e8, 'cDAI', true),
    totalVaultShares: TypedBigNumber.from(100_000e8, BigNumberType.VaultShare, vaultSymbolSettled),
    totalStrategyTokens: TypedBigNumber.from(0, BigNumberType.StrategyToken, vaultSymbolSettled),
    settlementStrategyTokenValue: TypedBigNumber.from(1e8, BigNumberType.StrategyToken, vaultSymbolSettled),
    settlementRate: BigNumber.from('0xA56FA5B99019A5C8000000'),
  } as unknown as VaultState;

  const vault: VaultConfig = {
    vaultAddress: '0xabc',
    strategy: '0xstrat',
    name: 'Cross Currency',
    primaryBorrowCurrency: 2,
    minAccountBorrowSize: TypedBigNumber.fromBalance(100e8, 'DAI', true),
    minCollateralRatioBasisPoints: 2000 * BASIS_POINT,
    maxDeleverageCollateralRatioBasisPoints: 4000 * BASIS_POINT,
    feeRateBasisPoints: 20 * BASIS_POINT,
    liquidationRatePercent: 104,
    maxBorrowMarketIndex: 2,
    maxPrimaryBorrowCapacity: TypedBigNumber.fromBalance(10_000e8, 'DAI', true),
    totalUsedPrimaryBorrowCapacity: TypedBigNumber.fromBalance(0, 'DAI', true),
    enabled: true,
    allowRollPosition: false,
    onlyVaultEntry: false,
    onlyVaultExit: false,
    onlyVaultRoll: false,
    onlyVaultDeleverage: false,
    onlyVaultSettle: false,
    allowsReentrancy: true,
    vaultStates: [vaultStateSettled, vaultState1],
  };

  return { vault, vaultSymbol };
}

export function MockSecondaryBorrowConfig(maturity: number) {
  const vaultSymbol = `0xdef:${maturity}`;
  const vaultSymbolSettled = `0xdef:${maturity - SECONDS_IN_QUARTER}`;

  const vaultState1: VaultState = {
    maturity,
    isSettled: false,
    totalPrimaryfCashBorrowed: TypedBigNumber.fromBalance(-100_000e8, 'DAI', true),
    totalAssetCash: TypedBigNumber.fromBalance(0, 'cDAI', true),
    totalVaultShares: TypedBigNumber.from(100_000e8, BigNumberType.VaultShare, vaultSymbol),
    totalStrategyTokens: TypedBigNumber.from(100_000e8, BigNumberType.StrategyToken, vaultSymbol),
    totalSecondaryfCashBorrowed: [TypedBigNumber.fromBalance(-100e8, 'ETH', true), undefined],
    totalSecondaryDebtShares: [TypedBigNumber.from(100e8, BigNumberType.DebtShare, `${vaultSymbol}:ETH`), undefined],
  } as unknown as VaultState;

  const vaultStateSettled: VaultState = {
    maturity: maturity - SECONDS_IN_QUARTER,
    isSettled: true,
    totalPrimaryfCashBorrowed: TypedBigNumber.fromBalance(-100_000e8, 'DAI', true),
    totalAssetCash: TypedBigNumber.fromBalance(5_000_000e8, 'cDAI', true),
    totalVaultShares: TypedBigNumber.from(100_000e8, BigNumberType.VaultShare, vaultSymbolSettled),
    totalStrategyTokens: TypedBigNumber.from(90_000e8, BigNumberType.StrategyToken, vaultSymbolSettled),
    settlementStrategyTokenValue: TypedBigNumber.from(1e8, BigNumberType.StrategyToken, vaultSymbolSettled),
    settlementRate: BigNumber.from('0xA56FA5B99019A5C8000000'),
    totalSecondaryfCashBorrowed: [TypedBigNumber.fromBalance(-100e8, 'ETH', true), undefined],
    totalSecondaryDebtShares: [
      TypedBigNumber.from(100e8, BigNumberType.DebtShare, `${vaultSymbolSettled}:ETH`),
      undefined,
    ],
    settlementSecondaryBorrowfCashSnapshot: [TypedBigNumber.fromBalance(10_000e8, 'DAI', true), undefined],
  } as unknown as VaultState;

  const vault: VaultConfig = {
    vaultAddress: '0xdef',
    strategy: '0xstrat',
    name: 'Two Token',
    primaryBorrowCurrency: 2,
    minAccountBorrowSize: TypedBigNumber.fromBalance(100e8, 'DAI', true),
    minCollateralRatioBasisPoints: 2000,
    maxDeleverageCollateralRatioBasisPoints: 4000,
    feeRateBasisPoints: 20,
    liquidationRatePercent: 104,
    maxBorrowMarketIndex: 2,
    maxPrimaryBorrowCapacity: TypedBigNumber.fromBalance(100_000e8, 'DAI', true),
    totalUsedPrimaryBorrowCapacity: TypedBigNumber.fromBalance(0, 'DAI', true),
    enabled: true,
    allowRollPosition: false,
    onlyVaultEntry: false,
    onlyVaultExit: false,
    onlyVaultRoll: false,
    onlyVaultDeleverage: false,
    onlyVaultSettle: false,
    allowsReentrancy: true,
    vaultStates: [vaultStateSettled, vaultState1],
    secondaryBorrowCurrencies: [1, 0],
    maxSecondaryBorrowCapacity: [TypedBigNumber.fromBalance(100_000e8, 'ETH', false), undefined],
    totalUsedSecondaryBorrowCapacity: [TypedBigNumber.fromBalance(0, 'ETH', false), undefined],
  };

  return { vault, vaultSymbol };
}

export class MockCrossCurrencyfCash extends CrossCurrencyfCash {
  public setLendCurrencyId(id: number) {
    this._lendCurrencyId = id;
  }
}
