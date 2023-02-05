import { BigNumber } from 'ethers';
import { AssetType } from '../../src/libs/types';
import { getNowSeconds } from '../../src/libs/utils';
import { BigNumberType, TypedBigNumber } from '../../src';
import { CashGroup, FreeCollateral, System } from '../../src/system';
import MockSystem from '../mocks/MockSystem';
import MockAccountData from '../mocks/MockAccountData';
import {
  INTERNAL_TOKEN_PRECISION,
  SECONDS_IN_QUARTER,
} from '../../src/config/constants';
import InterestRateRisk from '../../src/system/InterestRateRisk';

describe('calculates interest rate risk', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });

  afterEach(() => {
    system.clearMarketProviders();
  });
  const blockTime = CashGroup.getTimeReference(getNowSeconds());
  (system as MockSystem).setNTokenPortfolio(
    2,
    TypedBigNumber.fromBalance(5000e8, 'cDAI', true),
    // This PV is correctly calculated
    TypedBigNumber.fromBalance(6234606640000, 'cDAI', true),
    TypedBigNumber.fromBalance(10000e8, 'nDAI', true),
    [
      {
        currencyId: 2,
        maturity: blockTime + SECONDS_IN_QUARTER,
        assetType: AssetType.LiquidityToken_3Month,
        notional: TypedBigNumber.fromBalance(100_000e8, 'DAI', true),
        settlementDate: CashGroup.getSettlementDate(
          AssetType.LiquidityToken_6Month,
          blockTime + SECONDS_IN_QUARTER
        ),
      },
      {
        currencyId: 2,
        maturity: blockTime + SECONDS_IN_QUARTER * 2,
        assetType: AssetType.LiquidityToken_6Month,
        notional: TypedBigNumber.fromBalance(150_000e8, 'DAI', true),
        settlementDate: CashGroup.getSettlementDate(
          AssetType.LiquidityToken_6Month,
          blockTime + SECONDS_IN_QUARTER * 2
        ),
      },
    ],
    [
      {
        currencyId: 2,
        maturity: blockTime + SECONDS_IN_QUARTER,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.fromBalance(-4000e8, 'DAI', true),
        settlementDate: blockTime + SECONDS_IN_QUARTER,
      },
      {
        currencyId: 2,
        maturity: blockTime + SECONDS_IN_QUARTER * 2,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.fromBalance(-5000e8, 'DAI', true),
        settlementDate: blockTime + SECONDS_IN_QUARTER * 2,
      },
    ]
  );

  it('gets all the risky currencies', () => {
    const accountData = new MockAccountData(0, false, true, 0, [], [], true);
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    accountData.accountBalances = [
      // No leverage on ETH
      {
        currencyId: 1,
        cashBalance: TypedBigNumber.fromBalance(0, 'cETH', true),
        nTokenBalance: TypedBigNumber.fromBalance(100e8, 'nETH', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
      // Leveraged nToken
      {
        currencyId: 2,
        cashBalance: TypedBigNumber.fromBalance(0, 'cDAI', true),
        nTokenBalance: TypedBigNumber.fromBalance(100e8, 'nDAI', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
      // Cross Currency fCash on USDC
      {
        currencyId: 3,
        cashBalance: TypedBigNumber.fromBalance(0, 'cUSDC', true),
        nTokenBalance: TypedBigNumber.fromBalance(0, 'nUSDC', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
      // Tether debt against cash
      {
        currencyId: 6,
        cashBalance: TypedBigNumber.fromBalance(50e8, 'cUSDT', true),
        nTokenBalance: TypedBigNumber.fromBalance(0, 'nUSDT', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ];

    // DAI leverage on nToken
    accountData.updateAsset({
      currencyId: 2,
      maturity,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(-100e8, 'DAI', true),
      settlementDate: maturity,
    });
    // USDC cross currency
    accountData.updateAsset({
      currencyId: 3,
      maturity,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(-100e8, 'USDC', true),
      settlementDate: maturity,
    });
    accountData.updateAsset({
      currencyId: 3,
      maturity: maturity + SECONDS_IN_QUARTER,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(150e8, 'USDC', true),
      settlementDate: maturity,
    });
    // Tether Debt against cash
    accountData.updateAsset({
      currencyId: 6,
      maturity: maturity + SECONDS_IN_QUARTER,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(-100e8, 'USDT', true),
      settlementDate: maturity,
    });

    const risky = InterestRateRisk.getRiskyCurrencies(accountData);
    expect(risky).toStrictEqual([1, 2, 3, 6]);
  });

  it('gets weighted average interest rate', () => {
    const cashGroup = system.getCashGroup(1);
    const data = cashGroup.markets[0].market;
    system.setMarketProvider(cashGroup.markets[0].marketKey, {
      getMarket: () => {
        const override = cashGroup.markets[0];
        override.setMarket({
          totalfCash: data.totalfCash,
          totalAssetCash: data.totalAssetCash,
          totalLiquidity: TypedBigNumber.from(
            1000e8,
            BigNumberType.LiquidityToken,
            'cETH'
          ),
          oracleRate: 0.02e9,
          previousTradeTime: blockTime,
          lastImpliedRate: 0.02e9,
        });
        return override;
      },
    });

    system.setMarketProvider(cashGroup.markets[1].marketKey, {
      getMarket: () => {
        const override = cashGroup.markets[1];
        override.setMarket({
          totalfCash: data.totalfCash,
          totalAssetCash: data.totalAssetCash,
          totalLiquidity: TypedBigNumber.from(
            1000e8,
            BigNumberType.LiquidityToken,
            'cETH'
          ),
          oracleRate: 0.04e9,
          previousTradeTime: blockTime,
          lastImpliedRate: 0.04e9,
        });
        return override;
      },
    });
    expect(InterestRateRisk.getWeightedAvgInterestRate(1)).toBeCloseTo(
      0.03e9,
      -5
    );

    system.setMarketProvider(cashGroup.markets[0].marketKey, null);
    system.setMarketProvider(cashGroup.markets[1].marketKey, null);
  });

  it('gets simulated value at current rate', () => {
    const accountData = new MockAccountData(0, false, true, 0, [], [], true);
    const interestRate = InterestRateRisk.getWeightedAvgInterestRate(1);
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    accountData.accountBalances = [
      // Leveraged nToken
      {
        currencyId: 1,
        cashBalance: TypedBigNumber.fromBalance(0, 'cETH', true),
        nTokenBalance: TypedBigNumber.fromBalance(5000e8, 'nETH', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ];

    accountData.updateAsset(
      // DAI leverage on nToken
      {
        currencyId: 1,
        maturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.fromBalance(-90e8, 'ETH', true),
        settlementDate: maturity,
      }
    );

    const value = InterestRateRisk.simulateLocalCurrencyValue(
      1,
      interestRate!,
      accountData.cashBalance(1)!,
      accountData.portfolio,
      accountData.nTokenBalance(1),
      blockTime
    );

    const { netUnderlyingAvailable } = FreeCollateral.getFreeCollateral(
      accountData,
      blockTime
    );
    // The rough approximation is that the FC and the local currency value at the weighted average interest
    // rate should be about the same
    expect(
      netUnderlyingAvailable.get(1)!.sub(value).toNumber() /
        INTERNAL_TOKEN_PRECISION
    ).toBeCloseTo(0, -1);
  });

  it('finds liquidation rates, ntoken leverage', () => {
    // InterestRateRisk.getNTokenSimulatedValue(TypedBigNumber.fromBalance(100e8, 'nDAI', true), undefined, blockTime)
    const accountData = new MockAccountData(0, false, true, 0, [], [], true);
    const maturity = CashGroup.getMaturityForMarketIndex(3, blockTime);
    accountData.accountBalances = [
      // Leveraged nToken
      {
        currencyId: 3,
        cashBalance: TypedBigNumber.fromBalance(0, 'cUSDC', true),
        nTokenBalance: TypedBigNumber.fromBalance(5000e8, 'nUSDC', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ];

    accountData.updateAsset(
      // USDC leverage on nToken
      {
        currencyId: 3,
        maturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.fromBalance(-84e8, 'USDC', true),
        settlementDate: maturity,
      }
    );

    const risk = InterestRateRisk.calculateInterestRateRisk(
      accountData,
      blockTime
    );
    expect(risk.get(3)?.upperLiquidationInterestRate).toBe(null);
    expect(risk.get(3)?.lowerLiquidationInterestRate).toBeCloseTo(0.029e9, -8);
  });

  it('finds liquidation rates, cross maturity, undercollateralized', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const accountData = new MockAccountData(0, false, true, 0, [], [], true);
    accountData.accountBalances = [
      {
        currencyId: 3,
        cashBalance: TypedBigNumber.fromBalance(0, 'cUSDC', true),
        nTokenBalance: TypedBigNumber.fromBalance(0, 'nUSDC', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ];

    accountData.updateAsset({
      currencyId: 3,
      maturity,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(-100e8, 'USDC', true),
      settlementDate: maturity,
    });

    accountData.updateAsset({
      currencyId: 3,
      maturity: maturity + SECONDS_IN_QUARTER,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(104e8, 'USDC', true),
      settlementDate: maturity,
    });

    const { netETHDebtWithBuffer, netETHCollateralWithHaircut } =
      FreeCollateral.getFreeCollateral(accountData, blockTime);
    const aggregateFC = netETHCollateralWithHaircut.sub(netETHDebtWithBuffer);
    expect(aggregateFC.isNegative()).toBeTruthy();

    const risk = InterestRateRisk.calculateInterestRateRisk(
      accountData,
      blockTime
    );
    expect(risk.get(3)?.upperLiquidationInterestRate).toBeCloseTo(0.0225e9, -6);
    expect(risk.get(3)?.lowerLiquidationInterestRate).toBe(null);
  });

  it('finds liquidation rates, cross maturity, collateralized', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const accountData = new MockAccountData(0, false, true, 0, [], [], true);
    accountData.accountBalances = [
      {
        currencyId: 3,
        cashBalance: TypedBigNumber.fromBalance(0, 'cUSDC', true),
        nTokenBalance: TypedBigNumber.fromBalance(0, 'nUSDC', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ];

    accountData.updateAsset({
      currencyId: 3,
      maturity,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(-100e8, 'USDC', true),
      settlementDate: maturity,
    });

    accountData.updateAsset({
      currencyId: 3,
      maturity: maturity + SECONDS_IN_QUARTER,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(105e8, 'USDC', true),
      settlementDate: maturity,
    });

    const { netETHDebtWithBuffer, netETHCollateralWithHaircut } =
      FreeCollateral.getFreeCollateral(accountData, blockTime);
    const aggregateFC = netETHCollateralWithHaircut.sub(netETHDebtWithBuffer);
    expect(aggregateFC.isPositive()).toBeTruthy();

    const risk = InterestRateRisk.calculateInterestRateRisk(
      accountData,
      blockTime
    );
    expect(risk.get(3)?.upperLiquidationInterestRate).toBeCloseTo(0.0425e9, -6);
    expect(risk.get(3)?.lowerLiquidationInterestRate).toBe(null);
  });

  it('finds liquidation rates lower interest rate', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const accountData = new MockAccountData(0, false, true, 0, [], [], true);
    accountData.accountBalances = [
      {
        currencyId: 3,
        cashBalance: TypedBigNumber.fromBalance(5000e8, 'cUSDC', true),
        nTokenBalance: TypedBigNumber.fromBalance(0, 'nUSDC', true),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ];

    accountData.updateAsset({
      currencyId: 3,
      maturity: maturity + SECONDS_IN_QUARTER,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.fromBalance(-100.5e8, 'USDC', true),
      settlementDate: maturity,
    });

    const risk = InterestRateRisk.calculateInterestRateRisk(
      accountData,
      blockTime
    );
    expect(risk.get(3)?.upperLiquidationInterestRate).toBe(null);
    expect(risk.get(3)?.lowerLiquidationInterestRate).toBe(0.069e9);
  });
});
