import { BigNumber } from 'ethers';
import { System } from '../../src/system';
import MockSystem from '../mocks/MockSystem';
import { assetTypeNum, convertAssetType, getNowSeconds } from '../../src/libs/utils';
import CashGroup from '../../src/system/CashGroup';
import { SECONDS_IN_QUARTER } from '../../src/config/constants';
import { AssetType } from '../../src/libs/types';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';

describe('System tests', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });

  it('gets currencies', () => {
    const symbol = System.getSystem().getCurrencyBySymbol('ETH');
    const id = System.getSystem().getCurrencyById(symbol.id);
    const cashGroup = System.getSystem().getCurrencyById(symbol.id);
    expect(cashGroup).toBeDefined();
    expect(symbol).toBeDefined();
    expect(symbol).toEqual(id);
  });

  it('gets all currencies', () => {
    expect(system.getAllCurrencies()).toHaveLength(6);
    expect(system.getTradableCurrencies()).toHaveLength(5);
  });

  it('converts asset types', () => {
    for (let i = 1; i <= 8; i += 1) {
      const assetType = convertAssetType(BigNumber.from(i));
      expect(i).toEqual(assetTypeNum(assetType));
    }
  });

  it('settles fCash assets', (done) => {
    const tRef = CashGroup.getTimeReference(getNowSeconds());
    const maturity = tRef + SECONDS_IN_QUARTER;
    const assetRate = BigNumber.from('195000000000000000000000000');
    const underlyingSymbol = system.getUnderlyingSymbol(2);
    (system as MockSystem).setSettlementRate(2, maturity, assetRate);
    const notional = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, underlyingSymbol);

    system
      .settlePortfolioAsset(
        {
          currencyId: 2,
          maturity,
          assetType: AssetType.fCash,
          notional,
          settlementDate: maturity,
        },
        maturity
      )
      .then(({ assetCash, fCashAsset }) => {
        expect(assetCash.n.gt(5000e8)).toBeTruthy();
        expect(fCashAsset).toBeUndefined();
        done();
      });
  });

  it('settles liquidity token assets with settled fCash', (done) => {
    const tRef = CashGroup.getTimeReference(getNowSeconds());
    const maturity = tRef + SECONDS_IN_QUARTER;
    const assetRate = BigNumber.from('195000000000000000000000000');
    const { assetSymbol } = system.getCurrencyById(2);
    (system as MockSystem).setSettlementRate(2, maturity, assetRate);
    (system as MockSystem).setSettlementMarket(2, maturity, {
      settlementDate: maturity,
      totalAssetCash: TypedBigNumber.from(5_000_000e8, BigNumberType.InternalAsset, assetSymbol),
      totalLiquidity: TypedBigNumber.from(100_000e8, BigNumberType.LiquidityToken, assetSymbol),
      totalfCash: TypedBigNumber.from(100_000e8, BigNumberType.InternalUnderlying, assetSymbol),
    });
    const notional = TypedBigNumber.from(1000e8, BigNumberType.LiquidityToken, assetSymbol);

    system
      .settlePortfolioAsset(
        {
          currencyId: 2,
          maturity,
          assetType: AssetType.LiquidityToken_3Month,
          notional,
          settlementDate: maturity,
        },
        maturity
      )
      .then(({ assetCash, fCashAsset }) => {
        expect(assetCash.n.gt(100_000e8)).toBeTruthy();
        expect(fCashAsset).toBeUndefined();
        done();
      });
  });

  it('settles liquidity token assets with fCash', (done) => {
    const tRef = CashGroup.getTimeReference(getNowSeconds());
    const maturity = tRef + SECONDS_IN_QUARTER * 2;
    const settlementDate = tRef + SECONDS_IN_QUARTER;
    const assetRate = BigNumber.from('195000000000000000000000000');
    const { assetSymbol } = system.getCurrencyById(2);
    (system as MockSystem).setSettlementRate(2, maturity, assetRate);
    (system as MockSystem).setSettlementMarket(2, maturity, {
      settlementDate,
      totalAssetCash: TypedBigNumber.from(5_000_000e8, BigNumberType.InternalAsset, assetSymbol),
      totalLiquidity: TypedBigNumber.from(100_000e8, BigNumberType.LiquidityToken, assetSymbol),
      totalfCash: TypedBigNumber.from(100_000e8, BigNumberType.InternalUnderlying, assetSymbol),
    });
    const notional = TypedBigNumber.from(1000e8, BigNumberType.LiquidityToken, assetSymbol);

    system
      .settlePortfolioAsset(
        {
          currencyId: 2,
          maturity,
          assetType: AssetType.LiquidityToken_6Month,
          notional,
          settlementDate,
        },
        settlementDate
      )
      .then(({ assetCash, fCashAsset }) => {
        expect(assetCash.n.eq(50_000e8)).toBeTruthy();
        expect(fCashAsset!.notional.n.eq(1000e8)).toBeTruthy();
        expect(fCashAsset!.maturity).toEqual(maturity);
        expect(fCashAsset!.assetType).toEqual(AssetType.fCash);
        done();
      });
  });
});
