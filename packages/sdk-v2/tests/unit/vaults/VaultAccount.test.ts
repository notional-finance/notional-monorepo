import { BigNumberType, TypedBigNumber } from '../../../src';
import { SECONDS_IN_QUARTER } from '../../../src/config/constants';
import { System } from '../../../src/system';
import VaultAccount from '../../../src/vaults/VaultAccount';
import { MockCrossCurrencyConfig, MockSecondaryBorrowConfig } from '../../mocks/MockCrossCurrencyConfig';
import MockSystem from '../../mocks/MockSystem';

describe('Test Vault Account', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });
  const { maturity } = System.getSystem().getCashGroup(2).getMarket(1);
  const { vault, vaultSymbol } = MockCrossCurrencyConfig(maturity);
  const { vault: vault2 } = MockSecondaryBorrowConfig(maturity);
  system.setVault(vault);
  system.setVault(vault2);

  it('copies do not update each other', () => {
    const vaultAccount1 = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    const vaultAccount2 = VaultAccount.copy(vaultAccount1);
    vaultAccount2.updateMaturity(maturity);
    expect(vaultAccount1.maturity).toBe(0);
    expect(vaultAccount2.maturity).toBe(maturity);
  });

  it('does not allow maturities to be updated unless zero', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    vaultAccount.updateMaturity(maturity);
    expect(vaultAccount.maturity).toBe(maturity);
    expect(() => {
      vaultAccount.updateMaturity(maturity + SECONDS_IN_QUARTER);
    }).toThrow();
  });

  it('it does not allow vault shares to be negative', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    vaultAccount.updateMaturity(maturity);
    vaultAccount.updateVaultShares(TypedBigNumber.from(100, BigNumberType.VaultShare, vaultSymbol));
    expect(vaultAccount.vaultShares.toNumber()).toBe(100);

    vaultAccount.updateVaultShares(TypedBigNumber.from(100, BigNumberType.VaultShare, vaultSymbol));
    expect(vaultAccount.vaultShares.toNumber()).toBe(200);

    vaultAccount.updateVaultShares(TypedBigNumber.from(-50, BigNumberType.VaultShare, vaultSymbol));
    expect(vaultAccount.vaultShares.toNumber()).toBe(150);

    expect(() => {
      vaultAccount.updateVaultShares(TypedBigNumber.from(-200, BigNumberType.VaultShare, vaultSymbol));
    }).toThrow();
  });

  it('it does not allow primary borrow to be positive', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    vaultAccount.updateMaturity(maturity);

    vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(-100e8, 'DAI', true));
    expect(vaultAccount.primaryBorrowfCash.toNumber()).toBe(-100e8);

    vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(-500e8, 'DAI', true));
    expect(vaultAccount.primaryBorrowfCash.toNumber()).toBe(-600e8);

    vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(200e8, 'DAI', true));
    expect(vaultAccount.primaryBorrowfCash.toNumber()).toBe(-400e8);

    expect(() => {
      vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(500e8, 'DAI', true));
    }).toThrow();

    expect(() => {
      vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(100e8, 'USDC', true));
    }).toThrow();
  });

  it('it does not allow primary borrow to be below minimum', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    vaultAccount.updateMaturity(maturity);

    expect(() => {
      vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(-99e8, 'DAI', true));
    }).toThrow();

    vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(-100e8, 'DAI', true));

    expect(() => {
      vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.fromBalance(1e8, 'DAI', true));
    }).toThrow();
  });

  it('it does not allow strategy tokens to be added if there is asset cash', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault2.vaultAddress);
    vaultAccount.updateMaturity(maturity - SECONDS_IN_QUARTER);
    expect(() => {
      vaultAccount.addStrategyTokens(TypedBigNumber.from(100, BigNumberType.StrategyToken, vaultAccount.vaultSymbol));
    }).toThrow();
  });

  it('it adds strategy tokens proportionally', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress, maturity);
    const tokens = TypedBigNumber.from(1e8, BigNumberType.StrategyToken, vaultAccount.vaultSymbol);
    vaultAccount.addStrategyTokens(tokens);
    const { assetCash, strategyTokens } = vaultAccount.getPoolShare();

    expect(vaultAccount.vaultShares.toNumber()).toBe(1e8);
    expect(assetCash.isZero()).toBeTruthy();
    expect(strategyTokens.eq(tokens)).toBeTruthy();
  });

  it('it gets pool shares properly', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault2.vaultAddress, maturity - SECONDS_IN_QUARTER);
    vaultAccount.updateVaultShares(TypedBigNumber.from(100e8, BigNumberType.VaultShare, vaultAccount.vaultSymbol));

    const { assetCash, strategyTokens } = vaultAccount.getPoolShare();
    expect(assetCash.toNumber()).toBe(5000e8);
    expect(strategyTokens.toNumber()).toBe(90e8);
  });

  it('it fails on invalid secondary debt', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress, maturity);
    vaultAccount.addSecondaryDebtShares(undefined);
    vaultAccount.addSecondaryDebtShares([undefined, undefined]);

    expect(() => {
      vaultAccount.addSecondaryDebtShares([TypedBigNumber.fromBalance(100, 'ETH', true)]);
    }).toThrow();
  });

  it('it calculates secondary debt owed properly', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault2.vaultAddress, maturity);
    vaultAccount.addSecondaryDebtShares([TypedBigNumber.fromBalance(-1e8, 'ETH', true)]);
    expect(vaultAccount.getSecondaryDebtOwed()[0]?.toNumber()).toBe(-1e8);
    expect(vaultAccount.getSecondaryDebtOwed()[0]?.symbol).toBe('ETH');
    expect(vaultAccount.getSecondaryDebtOwed()[1]).toBeUndefined();
  });

  it('it calculates settlement in a single currency', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress, maturity - SECONDS_IN_QUARTER);
    const { vaultSymbol } = vaultAccount;
    vaultAccount.updateVaultShares(TypedBigNumber.from(100e8, BigNumberType.VaultShare, vaultAccount.vaultSymbol));
    vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'));
    const { assetCash, strategyTokens } = vaultAccount.settleVaultAccount();

    expect(assetCash.toNumber()).toBe(100e8);
    expect(assetCash.symbol).toBe('cDAI');
    expect(strategyTokens.symbol).toBe(vaultSymbol);
    expect(strategyTokens.toNumber()).toBe(0);
    expect(vaultAccount.maturity).toBe(0);
    expect(vaultAccount.primaryBorrowfCash.isZero()).toBeTruthy();
    expect(vaultAccount.vaultShares.isZero()).toBeTruthy();

    // Can now update to a new maturity
    vaultAccount.updateMaturity(maturity);
  });

  it('it throws on non matured vaults', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress, maturity);
    expect(() => {
      vaultAccount.settleVaultAccount();
    }).toThrow();
  });

  it('it calculates settlement with secondary borrows', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault2.vaultAddress, maturity - SECONDS_IN_QUARTER);
    const { vaultSymbol } = vaultAccount;
    vaultAccount.updateVaultShares(TypedBigNumber.from(100e8, BigNumberType.VaultShare, vaultAccount.vaultSymbol));
    vaultAccount.updatePrimaryBorrowfCash(TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'));
    vaultAccount.addSecondaryDebtShares([TypedBigNumber.fromBalance(-0.01e8, 'ETH', true)]);
    const { assetCash, strategyTokens } = vaultAccount.settleVaultAccount();

    expect(assetCash.toNumber()).toBe(0);
    expect(assetCash.symbol).toBe('cDAI');
    expect(strategyTokens.symbol).toBe(vaultSymbol);
    expect(strategyTokens.toNumber()).toBe(99e8); // Same as above but -1 DAI for the debt owed in secondary
    expect(vaultAccount.maturity).toBe(0);
    expect(vaultAccount.primaryBorrowfCash.isZero()).toBeTruthy();
    expect(vaultAccount.vaultShares.isZero()).toBeTruthy();

    // Can now update to a new maturity
    vaultAccount.updateMaturity(maturity);
  });
});
