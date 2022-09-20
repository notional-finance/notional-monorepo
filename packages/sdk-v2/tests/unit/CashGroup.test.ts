import { BigNumber, ethers } from 'ethers';
import { getNowSeconds } from '../../src/libs/utils';
import {
  BASIS_POINT,
  RATE_PRECISION,
  SECONDS_IN_QUARTER,
  SECONDS_IN_YEAR,
  SECONDS_IN_DAY,
} from '../../src/config/constants';
import { CashGroup, Market, System } from '../../src/system';
import { AssetType } from '../../src/libs/types';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';
import MockSystem from '../mocks/MockSystem';

describe('Cash Group', () => {
  const blockTime = getNowSeconds();
  const fCashHaircutBasisPoints = 30 * BASIS_POINT;
  const debtBufferBasisPoints = 60 * BASIS_POINT;
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });
  let cashGroup: CashGroup;

  beforeAll(() => {
    const rateOracleTimeWindowSeconds = 60 * 10;
    const totalFeeBasisPoints = 30 * BASIS_POINT;
    const reserveFeeSharePercent = 50;
    const markets = new Array<any>();
    for (let i = 1; i <= 7; i += 1) {
      const lastImpliedRate = (i * RATE_PRECISION) / 10;
      const oracleRate = (i * RATE_PRECISION) / 10 - 50 * BASIS_POINT;

      markets.push({
        totalAssetCash: TypedBigNumber.fromBalance(ethers.constants.WeiPerEther.mul(2), 'cETH', true),
        totalLiquidity: TypedBigNumber.fromBalance(ethers.constants.WeiPerEther, 'cETH', true),
        totalfCash: TypedBigNumber.fromBalance(ethers.constants.WeiPerEther, 'ETH', true),
        previousTradeTime: blockTime - 60 * 5,
        lastImpliedRate,
        oracleRate,
      });
    }

    const eth = system.getCurrencyBySymbol('ETH');
    cashGroup = new CashGroup(eth, {
      maxMarketIndex: 7,
      rateOracleTimeWindowSeconds,
      totalFeeBasisPoints,
      reserveFeeSharePercent,
      debtBufferBasisPoints,
      fCashHaircutBasisPoints,
      liquidityTokenHaircutsPercent: Array(7).fill(90),
      rateScalars: Array(7).fill(10),
      markets,
    });
    System.overrideSystem(system as unknown as System);
  });

  it('gets a time reference', () => {
    const tref = CashGroup.getTimeReference();
    expect(tref % SECONDS_IN_QUARTER).toEqual(0);
  });

  it('checks an idiosyncratic asset', () => {
    const tref = CashGroup.getTimeReference();
    expect(CashGroup.isIdiosyncratic(tref + 30 * SECONDS_IN_DAY)).toBe(true);
    expect(CashGroup.isIdiosyncratic(tref + SECONDS_IN_QUARTER)).toBe(false);
  });

  it('gets the correct market index and maturity', () => {
    const tref = CashGroup.getTimeReference(blockTime);
    const maturity = tref + SECONDS_IN_YEAR;
    const marketIndex = CashGroup.getMarketIndexForMaturity(maturity, blockTime);
    const newMaturity = CashGroup.getMaturityForMarketIndex(marketIndex, blockTime);

    expect(newMaturity).toEqual(maturity);
  });

  it('gets the oracle rate for a specified market', () => {
    for (let i = 1; i <= 7; i += 1) {
      const maturity = CashGroup.getMaturityForMarketIndex(i, blockTime);
      const oracleRate = cashGroup.markets[i - 1].marketOracleRate();
      expect(cashGroup.getOracleRate(maturity, blockTime)).toBeCloseTo(oracleRate, -5);
    }
  });

  it('linearly interpolates oracle rates between markets', () => {
    const shortMaturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const longMaturity = CashGroup.getMaturityForMarketIndex(2, blockTime);
    const shortRate = cashGroup.markets[0].marketOracleRate();
    const longRate = cashGroup.markets[1].marketOracleRate();

    const maturity = Math.trunc((longMaturity - shortMaturity) / 2) + shortMaturity;
    const expectedRate = Math.trunc((longRate + shortRate) / 2);
    expect(cashGroup.getOracleRate(maturity, blockTime)).toBeCloseTo(expectedRate, -5);
  });

  it('interpolates oracle rates between markets and block supply rate', () => {
    const shortMaturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const rate = cashGroup.markets[0].marketOracleRate();
    const maturity = Math.trunc((shortMaturity - blockTime) / 2) + blockTime;
    const supplyRate = cashGroup.blockSupplyRate;

    const expectedRate = Math.trunc((supplyRate + rate) / 2);
    expect(cashGroup.getOracleRate(maturity, blockTime)).toBeCloseTo(expectedRate, -5);
  });

  it('gets discounted positive fcash values', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const fCash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'ETH');
    const discounted = cashGroup.getfCashPresentValueUnderlyingInternal(maturity, fCash, false, blockTime);
    const annualizedRate = Market.exchangeToInterestRate(Market.exchangeRate(fCash, discounted), blockTime, maturity);

    const oracleRate = cashGroup.getOracleRate(maturity, blockTime);
    const diff = Math.abs(annualizedRate - oracleRate);

    expect(diff).toBeLessThanOrEqual(500);
  });

  it('gets haircut discounted positive fcash values', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const fCash = TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'ETH');
    const discounted = cashGroup.getfCashPresentValueUnderlyingInternal(maturity, fCash, true, blockTime);
    const annualizedRate = Market.exchangeToInterestRate(Market.exchangeRate(fCash, discounted), blockTime, maturity);

    const oracleRate = cashGroup.getOracleRate(maturity, blockTime) + fCashHaircutBasisPoints;
    const diff = Math.abs(annualizedRate - oracleRate);

    expect(diff).toBeLessThanOrEqual(500);
  });

  it('gets discounted negative fcash values', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const fCash = TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'ETH');
    const discounted = cashGroup.getfCashPresentValueUnderlyingInternal(maturity, fCash, false, blockTime);
    const annualizedRate = Market.exchangeToInterestRate(Market.exchangeRate(fCash, discounted), blockTime, maturity);

    const oracleRate = cashGroup.getOracleRate(maturity, blockTime);
    const diff = Math.abs(annualizedRate - oracleRate);

    expect(diff).toBeLessThanOrEqual(500);
  });

  it('gets haircut discounted negative fcash values', () => {
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);
    const fCash = TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'ETH');
    const discounted = cashGroup.getfCashPresentValueUnderlyingInternal(maturity, fCash, true, blockTime);
    const annualizedRate = Market.exchangeToInterestRate(Market.exchangeRate(fCash, discounted), blockTime, maturity);

    const oracleRate = cashGroup.getOracleRate(maturity, blockTime) - debtBufferBasisPoints;
    const diff = Math.abs(annualizedRate - oracleRate);

    expect(diff).toBeLessThanOrEqual(500);
  });

  it('gets liquidity token claims', () => {
    const { fCashClaim, assetCashClaim } = cashGroup.getLiquidityTokenValue(
      AssetType.LiquidityToken_3Month,
      TypedBigNumber.from(1e8, BigNumberType.LiquidityToken, 'ETH'),
      false
    );
    expect(fCashClaim.n).toEqual(BigNumber.from(1e8));
    expect(assetCashClaim.n).toEqual(BigNumber.from(2e8));
  });

  it('gets haircut liquidity token claims', () => {
    const { fCashClaim, assetCashClaim } = cashGroup.getLiquidityTokenValue(
      AssetType.LiquidityToken_3Month,
      TypedBigNumber.from(1e8, BigNumberType.LiquidityToken, 'ETH'),
      true
    );
    expect(fCashClaim.n).toEqual(BigNumber.from(0.9e8));
    expect(assetCashClaim.n).toEqual(BigNumber.from(1.8e8));
  });
});
