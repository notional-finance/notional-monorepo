import { getNowSeconds } from '../../src/libs/utils';
import { BASIS_POINT, RATE_PRECISION, SECONDS_IN_YEAR } from '../../src/config/constants';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';
import MockSystem from '../mocks/MockSystem';
import { System, Market } from '../../src/system';

describe('Market', () => {
  const blockTime = getNowSeconds();
  const maturity = blockTime + SECONDS_IN_YEAR;
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });

  const getMarket = () => new Market(2, 1, maturity, 30000000000, 30 * BASIS_POINT, 50, 60 * 10, 'cDAI', 'DAI');

  it('formats interest rates', () => {
    expect(Market.formatInterestRate(RATE_PRECISION)).toBe('100.000%');
    expect(Market.formatInterestRate(0.151232e9)).toBe('15.123%');
    expect(Market.formatInterestRate(0)).toBe('0.000%');
  });

  it('calculates the max interest rate, 18%', () => {
    const market = getMarket();
    market.rateScalar = 20 * RATE_PRECISION;
    const lastImpliedRate = 0.04e9;
    const oracleRate = 0.04e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });
    expect(market.maxInterestRate(blockTime) / RATE_PRECISION).toBeCloseTo(0.239, 3);
  });

  it('converts between interest rates and exchange rates', () => {
    const annualRate = Market.exchangeToInterestRate(1.1e9, blockTime, maturity);
    expect(Market.formatInterestRate(annualRate)).toBe('9.531%');
    const exchangeRate = Market.interestToExchangeRate(annualRate, blockTime, maturity);
    const ratio = Math.trunc((1.1e9 / exchangeRate) * RATE_PRECISION);
    expect(ratio).toBeCloseTo(RATE_PRECISION);
  });

  it('converts between fcash and cash from exchange rates', () => {
    const fCash = TypedBigNumber.from(105e8, BigNumberType.InternalUnderlying, 'DAI');
    const cash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI');
    const exchangeRate = Market.exchangeRate(fCash, cash);

    expect(Market.fCashFromExchangeRate(exchangeRate, cash).toString()).toBe(fCash.toString());
    expect(Market.cashFromExchangeRate(exchangeRate, fCash).toString()).toBe(cash.toString());
  });

  it('calculates fcash given positive slippage', () => {
    const fCash = TypedBigNumber.from(105e8, BigNumberType.InternalUnderlying, 'DAI');
    const cash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI');
    const annualizedSlippage = 50 * BASIS_POINT;
    const exchangeRate = Market.exchangeRate(fCash, cash);
    const annualRate = Market.exchangeToInterestRate(exchangeRate, blockTime, maturity);

    const { annualizedRate: slippageRate } = Market.getSlippageRate(
      fCash,
      cash,
      maturity,
      annualizedSlippage,
      blockTime
    );
    expect(annualRate).toBeCloseTo(slippageRate - annualizedSlippage, -1);
  });

  it('calculates fcash given negative slippage', () => {
    const fCash = TypedBigNumber.from(105e8, BigNumberType.InternalUnderlying, 'DAI');
    const cash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI');
    const annualizedSlippage = -50 * BASIS_POINT;
    const exchangeRate = Market.exchangeRate(fCash, cash);
    const annualRate = Market.exchangeToInterestRate(exchangeRate, blockTime, maturity);

    const { annualizedRate: slippageRate } = Market.getSlippageRate(
      fCash,
      cash,
      maturity,
      annualizedSlippage,
      blockTime
    );
    expect(annualRate).toBeCloseTo(slippageRate - annualizedSlippage, -1);
  });

  it('calculates fcash given negative rate', () => {
    const fCash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI');
    const cash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI');
    const annualizedSlippage = -50 * BASIS_POINT;

    const { annualizedRate: slippageRate } = Market.getSlippageRate(
      fCash,
      cash,
      maturity,
      annualizedSlippage,
      blockTime
    );
    expect(slippageRate).toEqual(0);
  });

  it('calculates market oracle rates in the past', () => {
    const market = getMarket();
    const lastImpliedRate = 0.01e9;
    const oracleRate = 0.09e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(0, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(0, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(0, 'DAI', true),
      previousTradeTime: blockTime - 60 * 15,
      lastImpliedRate,
      oracleRate,
    });

    expect(market.marketOracleRate(blockTime - 60 * 2000)).toEqual(lastImpliedRate);
  });

  it('calculates market oracle rates past timeout', () => {
    const market = getMarket();
    const lastImpliedRate = 0.01e9;
    const oracleRate = 0.09e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(0, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(0, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(0, 'DAI', true),
      previousTradeTime: blockTime - 60 * 15,
      lastImpliedRate,
      oracleRate,
    });

    expect(market.marketOracleRate(blockTime)).toEqual(lastImpliedRate);
  });

  it('calculates market oracle rates with weighted average', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.09e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(0, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(0, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(0, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });

    expect(market.marketOracleRate(blockTime)).toEqual(0.095e9);
  });

  it('gets market interest rates', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.1e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });

    const interestRate = market.marketAnnualizedRate(blockTime);
    const exchangeRate = market.marketExchangeRate(blockTime);
    expect(Math.abs(exchangeRate - Market.interestToExchangeRate(interestRate, blockTime, maturity))).toBeLessThan(100);
    expect(Math.abs(interestRate - 0.1e9)).toBeLessThanOrEqual(10);
  });

  it('calculates fcash to cash for borrowing', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.1e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });

    const { netCashToAccount } = market.getCashAmountGivenfCashAmount(
      TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'),
      blockTime
    );
    const fCashAmount = market.getfCashAmountGivenCashAmount(netCashToAccount, blockTime);
    expect(
      fCashAmount.add(TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI')).abs().toNumber()
    ).toBeLessThanOrEqual(10);
  });

  it('calculates fcash to cash for lending', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.1e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });

    const { netCashToAccount } = market.getCashAmountGivenfCashAmount(
      TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI'),
      blockTime
    );
    const fCashAmount = market.getfCashAmountGivenCashAmount(netCashToAccount, blockTime);
    expect(
      fCashAmount.sub(TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI')).abs().toNumber()
    ).toBeLessThanOrEqual(10);
  });

  it('fails when non internal underlying values are used', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.1e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });
    const fCash = TypedBigNumber.from(105e8, BigNumberType.InternalAsset, 'cDAI');
    const cash = TypedBigNumber.from(100e8, BigNumberType.InternalAsset, 'cDAI');
    const exchangeRate = 1.1e9;

    expect(() => {
      market.getCashAmountGivenfCashAmount(TypedBigNumber.from(100e8, BigNumberType.InternalAsset, 'cDAI'), blockTime);
    }).toThrowError();
    expect(() => {
      market.getfCashAmountGivenCashAmount(TypedBigNumber.from(100e8, BigNumberType.InternalAsset, 'cDAI'), blockTime);
    }).toThrowError();

    expect(() => {
      Market.exchangeRate(fCash, cash);
    }).toThrowError();

    expect(() => {
      Market.fCashFromExchangeRate(exchangeRate, cash);
    }).toThrowError();
    expect(() => {
      Market.cashFromExchangeRate(exchangeRate, fCash);
    }).toThrowError();
  });

  it('returns a simulated market at 18% interest', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.1e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });

    const override = market.getSimulatedMarket(0.18e9, blockTime);
    expect(override.marketOracleRate(blockTime)).toBe(0.18e9);
    expect(override.fCashUtilization).toBeCloseTo(0.9405, 3);
  });

  it('returns a simulated market at 0% interest', () => {
    const market = getMarket();
    const lastImpliedRate = 0.1e9;
    const oracleRate = 0.1e9;
    market.setMarket({
      totalAssetCash: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalLiquidity: TypedBigNumber.fromBalance(50000e8, 'cDAI', true),
      totalfCash: TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      previousTradeTime: blockTime - 60 * 5,
      lastImpliedRate,
      oracleRate,
    });

    const override = market.getSimulatedMarket(0, blockTime);
    expect(override.marketOracleRate(blockTime)).toBe(0);
    expect(override.fCashUtilization).toBeCloseTo(0.0408, 3);
  });
});
