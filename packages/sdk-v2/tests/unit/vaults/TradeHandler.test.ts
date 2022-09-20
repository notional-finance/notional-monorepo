import { TypedBigNumber } from '../../../src';
import { System } from '../../../src/system';
import TradeHandler from '../../../src/trading/TradeHandler';
import MockSystem from '../../mocks/MockSystem';

describe('Test Trade Handler', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });

  it('gets trading estimates', () => {
    expect(System.getSystem().getTradingEstimates('USDC', 'DAI')).toBeDefined();
    expect(System.getSystem().getTradingEstimates('DAI', 'USDC')).toBeDefined();
    expect(System.getSystem().getTradingEstimates('DAI', 'ETH')).toBeDefined();
    expect(System.getSystem().getTradingEstimates(2, 1)).toBeDefined();
    expect(System.getSystem().getTradingEstimates(3, 2)).toBeDefined();
    expect(System.getSystem().getTradingEstimates('0x6b175474e89094c44da98b954eedeac495271d0f', 'ETH')).toBeDefined();
  });

  it('returns a buy estimate below the minimum threshold', () => {
    const { buyEstimate, minPurchaseAmount } = TradeHandler.getBuyEstimate(
      'ETH',
      TypedBigNumber.fromBalance(100e8, 'DAI', true),
      0.005
    );

    expect(buyEstimate.toExactString()).toBe('0.061923');
    expect(buyEstimate.toFloat() * 0.995).toBeCloseTo(minPurchaseAmount.toFloat());
  });

  it('returns a buy estimate', () => {
    const { buyEstimate, minPurchaseAmount } = TradeHandler.getBuyEstimate(
      'ETH',
      TypedBigNumber.fromBalance(1_000_000e8, 'DAI', true),
      0.005
    );
    expect(buyEstimate.toExactString()).toBe('618.53');
    expect(buyEstimate.toFloat() * 0.995).toBeCloseTo(minPurchaseAmount.toFloat());
  });

  it('returns a buy estimate DAI to USDC', () => {
    const { buyEstimate, minPurchaseAmount } = TradeHandler.getBuyEstimate(
      'DAI',
      TypedBigNumber.fromBalance(1_000_000e8, 'USDC', true),
      0.005
    );
    expect(buyEstimate.toFloat()).toBeCloseTo(1_000_000 - 10, -1);
    expect(buyEstimate.symbol).toBe('DAI');
    expect(buyEstimate.toFloat() * 0.995).toBeCloseTo(minPurchaseAmount.toFloat());
  });

  it('returns a buy estimate USDC to DAI', () => {
    const { buyEstimate, minPurchaseAmount } = TradeHandler.getBuyEstimate(
      'USDC',
      TypedBigNumber.fromBalance(1_000_000e8, 'DAI', true),
      0.005
    );
    expect(buyEstimate.toFloat()).toBeCloseTo(1_000_000 - 60, -1);
    expect(buyEstimate.symbol).toBe('USDC');
    expect(buyEstimate.toFloat() * 0.995).toBeCloseTo(minPurchaseAmount.toFloat());
  });

  it('throws on a buy estimate above the maximum threshold', () => {
    expect(() => {
      TradeHandler.getBuyEstimate('ETH', TypedBigNumber.fromBalance(10_000_100e8, 'DAI', true), 0.005);
    }).toThrow();
  });

  it('returns a sell estimate below the minimum threshold', () => {
    const { sellEstimate, minPurchaseAmount } = TradeHandler.getSellEstimate(
      'DAI',
      TypedBigNumber.fromBalance(0.061923e8, 'ETH', true),
      0.005
    );

    expect(sellEstimate.toExactString()).toBe('100.0');
    expect(sellEstimate.toFloat() * 1.005).toBeCloseTo(minPurchaseAmount.toFloat());
  });

  it('returns a sell estimate', () => {
    const { sellEstimate, minPurchaseAmount } = TradeHandler.getSellEstimate(
      'DAI',
      TypedBigNumber.fromBalance(618.53e8, 'ETH', true),
      0.005
    );
    expect(sellEstimate.toFloat()).toBeCloseTo(1_000_016, 0);
    expect(sellEstimate.toFloat() * 1.005).toBeCloseTo(minPurchaseAmount.toFloat());
  });

  it('throws on a buy estimate above the maximum threshold', () => {
    expect(() => {
      TradeHandler.getBuyEstimate('DAI', TypedBigNumber.fromBalance(6000e8, 'ETH', true), 0.005);
    }).toThrow();
  });
});
