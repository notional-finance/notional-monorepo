import { Network } from '../src/Definitions';
import { OracleRegistry } from '../src/oracles/OracleRegistry';

describe('Oracle Path', () => {
  it('[FORWARD] can find a path from usd => eth', () => {
    const path = OracleRegistry.findPath('USD', 'ETH', Network.Mainnet);
    expect(path.length).toBe(1);
    expect(path[0].key).toBe('ETH/USD');
    expect(path[0].mustInvert).toBe(false);
  });

  it('[REVERSE] can find a path from usd => eth', () => {
    const path = OracleRegistry.findPath('ETH', 'USD', Network.Mainnet);
    expect(path.length).toBe(1);
    expect(path[0].key).toBe('ETH/USD');
    expect(path[0].mustInvert).toBe(true);
  });

  it('[MULTIHOP] can find a path from cUSDC => cETH', () => {
    const path = OracleRegistry.findPath('cETH', 'cUSDC', Network.Mainnet);
    expect(path.length).toBe(4);
    expect(path.map((p) => p.key)).toEqual([
      'USDC/cUSDC',
      'USDC/USD',
      'ETH/USD',
      'ETH/cETH',
    ]);
    expect(path.map((p) => p.mustInvert)).toEqual([true, false, true, false]);

    const revPath = OracleRegistry.findPath('cUSDC', 'cETH', Network.Mainnet);
    expect(revPath.length).toBe(4);
    expect(revPath.map((p) => p.key)).toEqual([
      'ETH/cETH',
      'ETH/USD',
      'USDC/USD',
      'USDC/cUSDC',
    ]);
    expect(path.map((p) => p.mustInvert)).toEqual([true, false, true, false]);
  });

  it('[ERROR] throws on an unknown path', () => {
    expect(() =>
      OracleRegistry.findPath('xxxx', 'USD', Network.Mainnet)
    ).toThrowError('Path from xxxx to USD not found');
  });
});

describe('Fetch Oracle Rates', () => {
  // TODO: use a snapshot test here on a fixed block
  it('generates aggregate calls and fetches oracle rates', () => {
    // OracleRegistry.fetchOracleData(Network.Mainnet, hre.provider);
  });

  it.todo('returns the latest value from an oracle path');
  it.todo('returns undefined if the oracle path is not complete');
  it.todo('returns the latest value from a single oracle');
  it.todo('subscribes to an oracle path');
  it.todo('subscribes to a single oracle');
  it.todo('subscribes to update blocks');
});
