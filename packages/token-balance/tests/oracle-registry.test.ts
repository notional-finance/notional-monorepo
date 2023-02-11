import { ethers } from 'ethers';
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
      'cUSDC/USDC',
      'USDC/USD',
      'ETH/USD',
      'cETH/ETH',
    ]);
    expect(path.map((p) => p.mustInvert)).toEqual([false, false, true, true]);

    const revPath = OracleRegistry.findPath('cUSDC', 'cETH', Network.Mainnet);
    expect(revPath.length).toBe(4);
    expect(revPath.map((p) => p.key)).toEqual([
      'cETH/ETH',
      'ETH/USD',
      'USDC/USD',
      'cUSDC/USDC',
    ]);
    expect(path.map((p) => p.mustInvert)).toEqual([false, false, true, true]);
  });

  it('[ERROR] throws on an unknown path', () => {
    expect(() =>
      OracleRegistry.findPath('xxxx', 'USD', Network.Mainnet)
    ).toThrowError('Path from xxxx to USD not found');
  });

  it('returns undefined if the oracle path is not complete', () => {
    const path = OracleRegistry.findPath('cUSDC', 'cETH', Network.Mainnet);
    const rate = OracleRegistry.getLatestFromPath(Network.Mainnet, path);
    expect(rate).not.toBeDefined();
  });
});

describe.withFork(
  { blockNumber: 16605421, network: 'mainnet' },
  'Fetch Oracle Rates',
  () => {
    beforeAll(async () => {
      await OracleRegistry.fetchOracleData(Network.Mainnet, provider);
    }, 60_000);

    it('generates aggregate calls and fetches oracle rates', async () => {
      const { blockNumber, results } = await OracleRegistry.fetchOracleData(
        Network.Mainnet,
        provider
      );
      expect(blockNumber).toBe(16605421);
      expect(results).toMatchSnapshot();
    }, 60_000);

    it('returns the latest value from an oracle path', () => {
      const path = OracleRegistry.findPath('cUSDC', 'cETH', Network.Mainnet);
      const rate = OracleRegistry.getLatestFromPath(Network.Mainnet, path);

      expect(rate).toBeDefined();
      expect(ethers.utils.formatUnits(rate!, 9)).toBe('1341.740810123');
    });

    it('subscribes to an oracle path', (done) => {
      const path = OracleRegistry.findPath('USD', 'ETH', Network.Mainnet);
      let subCalls = 0;
      OracleRegistry.subscribeToPath(Network.Mainnet, path).subscribe(
        (rates) => {
          subCalls += 1;
          expect(rates?.toNumber()).toBe(1519321584080);
          if (subCalls == 2) done();
        }
      );

      OracleRegistry.fetchOracleData(Network.Mainnet, provider);
    }, 1000);

    it('returns the latest value from a single oracle', () => {
      const latest = OracleRegistry.getLatestFromOracle(
        Network.Mainnet,
        'ETH/USD:0'
      );
      expect(latest?.toNumber()).toBe(1519321584080);
    });

    it('subscribes to a single oracle', (done) => {
      OracleRegistry.subscribeToOracle(Network.Mainnet, 'ETH/USD:0').subscribe(
        (rate) => {
          expect(rate?.toNumber()).toBe(1519321584080);
          done();
        }
      );
    });

    it('subscribes to update blocks', (done) => {
      OracleRegistry.subscribeLastUpdateBlock(Network.Mainnet)?.subscribe(
        (block) => {
          expect(block).toBe(16605421);
          done();
        }
      );
    });
  }
);
