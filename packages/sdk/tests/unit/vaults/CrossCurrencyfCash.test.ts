import { MockCrossCurrencyConfig } from '../../mocks/MockCrossCurrencyConfig';
import { ETHRate } from '../../../src/data';
import BaseVault from '../../../src/vaults/BaseVault';
import { BigNumberType, TypedBigNumber } from '../../../src';
import {
  BASIS_POINT,
  RATE_PRECISION,
  SECONDS_IN_DAY,
  SECONDS_IN_QUARTER,
} from '../../../src/config/constants';
import { System, CashGroup } from '../../../src/system';
import VaultAccount from '../../../src/vaults/VaultAccount';
import MockSystem, { MutableForTesting } from '../../mocks/MockSystem';
import CrossCurrencyfCash from '../../../src/vaults/strategy/notional/CrossCurrencyfCash';
import { getNowSeconds } from '../../../src/libs/utils';

describe('Cross Currency fCash', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });
  const { maturity } = System.getSystem().getCashGroup(2).getMarket(1);
  const { vault, vaultSymbol } = MockCrossCurrencyConfig(maturity);
  const crossCurrency = new CrossCurrencyfCash(vault.vaultAddress, {
    lendCurrencyId: 3,
  });
  system.setVault(vault);
  const blockTime = CashGroup.getTimeReference(getNowSeconds());

  it('calculates collateral ratios from leverage ratios and vice versa', () => {
    const leverageRatio = BaseVault.collateralToLeverageRatio(0.2e9);
    expect(BaseVault.leverageToCollateralRatio(leverageRatio)).toBe(0.2e9);
  });

  it('gets strategy token value', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    vaultAccount.updateMaturity(maturity);
    vaultAccount.addStrategyTokens(
      TypedBigNumber.from(100e8, BigNumberType.StrategyToken, vaultSymbol),
      false
    );
    const value = crossCurrency.getStrategyTokenValue(vaultAccount);
    expect(value.symbol).toBe('DAI');
    expect(value.toNumber()).toBeLessThan(100e8);
    expect(value.toNumber()).toBeGreaterThan(95e8);
  });

  it('gets value from strategy token', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);
    vaultAccount.updateMaturity(maturity);
    vaultAccount.addStrategyTokens(
      TypedBigNumber.from(100e8, BigNumberType.StrategyToken, vaultSymbol),
      false
    );
    const value = crossCurrency.getStrategyTokenValue(vaultAccount);
    const strategyTokens = crossCurrency.getStrategyTokensFromValue(
      maturity,
      value
    );
    expect(strategyTokens.toNumber()).toBeCloseTo(100e8, -3);
  });

  it('it converts between deposit and strategy tokens', () => {
    const depositAmount = TypedBigNumber.fromBalance(100e8, 'DAI', true);
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    const { strategyTokens } = crossCurrency.getStrategyTokensGivenDeposit(
      vaultAccount.maturity,
      depositAmount,
      blockTime
    );

    const { requiredDeposit } = crossCurrency.getDepositGivenStrategyTokens(
      vaultAccount.maturity,
      strategyTokens,
      blockTime
    );

    expect(requiredDeposit.toNumber()).toBeCloseTo(
      depositAmount.toNumber(),
      -3
    );
  });

  it('it converts between strategy tokens and redemption', () => {
    const strategyTokens = TypedBigNumber.from(
      100e8,
      BigNumberType.StrategyToken,
      vaultSymbol
    );
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    const { amountRedeemed } = crossCurrency.getRedeemGivenStrategyTokens(
      vaultAccount.maturity,
      strategyTokens,
      blockTime
    );

    const { strategyTokens: strategyTokens1 } =
      crossCurrency.getStrategyTokensGivenRedeem(
        vaultAccount.maturity,
        amountRedeemed,
        blockTime
      );
    expect(strategyTokens1.toNumber()).toBeCloseTo(
      strategyTokens.toNumber(),
      -3
    );
  });

  it('simulates entering a vault with empty account', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);

    const fCashToBorrow = TypedBigNumber.fromBalance(-100e8, 'DAI', true);
    const { assessedFee, totalCashDeposit, newVaultAccount } =
      crossCurrency.simulateEnter(
        vaultAccount,
        maturity,
        fCashToBorrow,
        TypedBigNumber.fromBalance(25e8, 'DAI', true),
        true,
        blockTime
      );

    expect(totalCashDeposit.add(assessedFee).toNumber()).toBeCloseTo(
      124.375e8,
      -9
    );
    expect(newVaultAccount.primaryBorrowfCash.eq(fCashToBorrow)).toBeTruthy();
    expect(
      crossCurrency.getCollateralRatio(newVaultAccount)! / RATE_PRECISION
    ).toBeCloseTo(0.22, 1);
    expect(
      crossCurrency.getLeverageRatio(newVaultAccount)! / RATE_PRECISION
    ).toBeCloseTo(4.3, 0);
  });

  it('simulates entering a vault with matching shares', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.fromBalance(-100e8, 'DAI', true),
      false
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        12553117188,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );

    const fCashToBorrow = TypedBigNumber.fromBalance(-100e8, 'DAI', true);
    const { assessedFee, totalCashDeposit, newVaultAccount } =
      crossCurrency.simulateEnter(
        vaultAccount,
        maturity,
        fCashToBorrow,
        TypedBigNumber.fromBalance(25e8, 'DAI', true),
        true,
        blockTime
      );

    expect(totalCashDeposit.add(assessedFee).toNumber()).toBeCloseTo(
      124.375e8,
      -9
    );
    expect(
      newVaultAccount.primaryBorrowfCash.eq(
        fCashToBorrow.add(vaultAccount.primaryBorrowfCash)
      )
    ).toBeTruthy();
    expect(
      crossCurrency.getCollateralRatio(newVaultAccount)! / RATE_PRECISION
    ).toBeCloseTo(0.23, 1);
    expect(
      crossCurrency.getLeverageRatio(newVaultAccount)! / RATE_PRECISION
    ).toBeCloseTo(4.2, 0);
  });

  it('simulates entering a vault with settled shares', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity - SECONDS_IN_QUARTER
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        100e8,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'),
      false
    );
    const { assessedFee, totalCashDeposit, newVaultAccount } =
      crossCurrency.simulateEnter(
        vaultAccount,
        maturity,
        TypedBigNumber.fromBalance(-100e8, 'DAI', true),
        TypedBigNumber.fromBalance(0, 'DAI', true),
        true,
        blockTime
      );

    // There is 2e8 asset cash from the settled vault
    expect(totalCashDeposit.add(assessedFee).toNumber()).toBeCloseTo(
      101.3764e8,
      -9
    );
    expect(newVaultAccount.primaryBorrowfCash.toNumber()).toBe(-100e8);
    expect(newVaultAccount.vaultShares.toNumber()).toBeCloseTo(101.799e8, -8);
  });

  it('checks borrow capacities do not exceed', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    expect(() => {
      crossCurrency.simulateEnter(
        vaultAccount,
        maturity,
        TypedBigNumber.fromBalance(-11_000e8, 'DAI', true),
        TypedBigNumber.fromBalance(25e8, 'DAI', true),
        true,
        blockTime
      );
    }).toThrow('Exceeds max primary borrow capacity');
  });

  it('simulates exiting a vault given repayment', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.fromBalance(-100e8, 'DAI', true),
      false
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        12553117188,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );

    const { costToRepay, vaultSharesToRedeemAtCost, newVaultAccount } =
      crossCurrency.simulateExitPreMaturityGivenRepayment(
        vaultAccount,
        TypedBigNumber.fromBalance(100e8, 'DAI', true),
        blockTime
      );

    expect(costToRepay.neg().toUnderlying().toNumber()).toBeLessThan(100e8);
    expect(costToRepay.neg().toUnderlying().toNumber()).toBeGreaterThan(98.5e8);
    expect(vaultSharesToRedeemAtCost.toNumber()).toBeGreaterThan(100e8);
    expect(newVaultAccount.primaryBorrowfCash.isZero()).toBeTruthy();
    expect(
      vaultAccount.vaultShares.sub(newVaultAccount.vaultShares).toExactString()
    ).toBe(vaultSharesToRedeemAtCost.toExactString());
  });

  it('simulates exiting a vault with settled shares', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity - SECONDS_IN_QUARTER
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        100e8,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'),
      false
    );
    const { amountRedeemed, newVaultAccount } =
      crossCurrency.simulateExitPostMaturity(vaultAccount);
    expect(newVaultAccount.primaryBorrowfCash.isZero()).toBeTruthy();
    expect(newVaultAccount.vaultShares.isZero()).toBeTruthy();
    expect(amountRedeemed.toNumber()).toBeCloseTo(2e8);
  });

  it('simulates exiting a vault given withdraw', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.fromBalance(-100e8, 'DAI', true),
      false
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        12553117188,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );

    const { vaultSharesToRedeemAtCost, newVaultAccount } =
      crossCurrency.simulateExitPreMaturityGivenWithdraw(
        vaultAccount,
        TypedBigNumber.fromBalance(10e8, 'DAI', true),
        blockTime
      );
    expect(vaultSharesToRedeemAtCost.toFloat()).toBeCloseTo(10.1, 1);
    expect(
      newVaultAccount.primaryBorrowfCash.eq(vaultAccount.primaryBorrowfCash)
    ).toBeTruthy();
    expect(
      newVaultAccount.vaultShares.lt(vaultAccount.vaultShares)
    ).toBeTruthy();
    expect(crossCurrency.getLeverageRatio(newVaultAccount)).toBeGreaterThan(
      crossCurrency.getLeverageRatio(vaultAccount)
    );
  });

  it('simulates exiting a vault given target leverage ratio', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.fromBalance(-10_000e8, 'DAI', true),
      false
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        1255311718800,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );

    const { newVaultAccount } = crossCurrency.getExitParamsFromLeverageRatio(
      vaultAccount,
      3.0e9,
      BASIS_POINT * 500,
      blockTime
    );
    expect(crossCurrency.getLeverageRatio(newVaultAccount)).toBeCloseTo(
      3.0e9,
      -8
    );
  });

  it('simulates exiting a vault given target leverage ratio to full exit', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    vaultAccount.updatePrimaryBorrowfCash(
      TypedBigNumber.fromBalance(-10_000e8, 'DAI', true),
      false
    );
    vaultAccount.updateVaultShares(
      TypedBigNumber.from(
        1255311718800,
        BigNumberType.VaultShare,
        vaultAccount.vaultSymbol
      ),
      false
    );

    const { newVaultAccount, isFullExit } =
      crossCurrency.getExitParamsFromLeverageRatio(
        vaultAccount,
        1.0e9,
        BASIS_POINT * 500,
        blockTime
      );

    expect(isFullExit).toBe(true);
    expect(newVaultAccount.primaryBorrowfCash.isZero()).toBe(true);
    expect(crossCurrency.getLeverageRatio(newVaultAccount)).toBe(0);
  });

  it('fails when attempting to roll a vault that is not allowed to', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(vault.vaultAddress);

    const { newVaultAccount } = crossCurrency.simulateEnter(
      vaultAccount,
      maturity,
      TypedBigNumber.fromBalance(-100e8, 'DAI', true),
      TypedBigNumber.fromBalance(25e8, 'DAI', true),
      true,
      blockTime
    );

    expect(() => {
      crossCurrency.simulateRollPosition(
        newVaultAccount,
        maturity + SECONDS_IN_DAY,
        TypedBigNumber.getZeroUnderlying(2),
        0.0025,
        true,
        blockTime
      );
    }).toThrow('Cannot roll position in vault');
  });

  it('simulates entering a vault given leverage ratio', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    const depositAmount = TypedBigNumber.fromBalance(25e8, 'DAI', true);
    const fCashToBorrow = crossCurrency.getfCashBorrowFromLeverageRatio(
      vaultAccount.maturity,
      depositAmount,
      6e9,
      undefined,
      blockTime
    );

    const { newVaultAccount } = crossCurrency.simulateEnter(
      vaultAccount,
      maturity,
      fCashToBorrow,
      depositAmount,
      true,
      blockTime
    );
    expect(
      crossCurrency.getLeverageRatio(newVaultAccount)! / RATE_PRECISION
    ).toBeCloseTo(6.0);
  });

  it('simulates entering a vault given leverage ratio with an existing account', () => {
    const depositAmount = TypedBigNumber.fromBalance(25e8, 'DAI', true);
    const { newVaultAccount: vaultAccount } = crossCurrency.simulateEnter(
      VaultAccount.emptyVaultAccount(vault.vaultAddress, maturity),
      maturity,
      TypedBigNumber.fromBalance(-100e8, 'DAI', true),
      depositAmount,
      true,
      blockTime
    );

    const fCashToBorrow = crossCurrency.getfCashBorrowFromLeverageRatio(
      vaultAccount.maturity,
      depositAmount,
      6e9,
      vaultAccount,
      blockTime
    );

    const { newVaultAccount: finalVaultAccount } = crossCurrency.simulateEnter(
      vaultAccount,
      maturity,
      fCashToBorrow,
      depositAmount,
      true,
      blockTime
    );
    expect(
      crossCurrency.getLeverageRatio(finalVaultAccount) / RATE_PRECISION
    ).toBeCloseTo(6.0);
  });

  it('calculates liquidation thresholds', () => {
    const vaultAccount = VaultAccount.emptyVaultAccount(
      vault.vaultAddress,
      maturity
    );
    const depositAmount = TypedBigNumber.fromBalance(100e8, 'DAI', true);
    const fCashToBorrow = crossCurrency.getfCashBorrowFromLeverageRatio(
      vaultAccount.maturity,
      depositAmount,
      4.7e9,
      undefined,
      blockTime
    );

    const { newVaultAccount } = crossCurrency.simulateEnter(
      vaultAccount,
      maturity,
      fCashToBorrow,
      depositAmount,
      true,
      blockTime
    );

    const thresholds = crossCurrency.getLiquidationThresholds(newVaultAccount);

    // Simulate exchange rate at liquidation price
    const ethRateData: MutableForTesting<ETHRate> = system.getETHRate(3);
    ethRateData.latestRate =
      thresholds[0].ethExchangeRate!.toExternalPrecision().n;
    const rateProvider = { getETHRate: () => ethRateData };
    System.getSystem().setETHRateProvider(3, rateProvider);
    expect(
      crossCurrency.getCollateralRatio(newVaultAccount)! / RATE_PRECISION
    ).toBeCloseTo(0.2, 4);
    System.getSystem().setETHRateProvider(3, null);

    // TODO: need to find an in-range liquidation threshold
    // const { strategyTokens } = newVaultAccount.getPoolShare();
    // const fCash = TypedBigNumber.fromBalance(strategyTokens.n, 'USDC', true);
    // const { liquidationVaultSharesValue } = crossCurrency.getLiquidationVaultShareValue(newVaultAccount);
    // const fCashPVAtLiquidationRate = Market.cashFromExchangeRate(
    //   Market.interestToExchangeRate(thresholds[1].rate!, getNowSeconds(), vaultAccount.maturity),
    //   fCash
    // );
    // expect(fCashPVAtLiquidationRate.toNumber()).toBeCloseTo(liquidationVaultSharesValue.toNumber(), -6);
  });
});
