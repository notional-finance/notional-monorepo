import { BigNumber, ethers } from 'ethers';
import { Network } from '../src/Definitions';
import { OracleRegistry } from '../src/oracles/OracleRegistry';
import fetchMock from 'jest-fetch-mock';

describe('Oracle Path', () => {
  it('[FORWARD] can find a path from usd => eth', () => {
    const path = OracleRegistry.findPath('ETH', 'USD', Network.Mainnet);
    expect(path.length).toBe(1);
    expect(path[0].key).toBe('ETH/USD');
    expect(path[0].mustInvert).toBe(false);
  });

  it('[REVERSE] can find a path from usd => eth', () => {
    const path = OracleRegistry.findPath('USD', 'ETH', Network.Mainnet);
    expect(path.length).toBe(1);
    expect(path[0].key).toBe('ETH/USD');
    expect(path[0].mustInvert).toBe(true);
  });

  it('[MULTIHOP] can find a path from cUSDC => cETH', () => {
    const path = OracleRegistry.findPath('cUSDC', 'cETH', Network.Mainnet);
    expect(path.length).toBe(4);
    expect(path.map((p) => p.key)).toEqual([
      'cUSDC/USDC',
      'USDC/USD',
      'ETH/USD',
      'cETH/ETH',
    ]);
    expect(path.map((p) => p.mustInvert)).toEqual([false, false, true, true]);

    const revPath = OracleRegistry.findPath('cETH', 'cUSDC', Network.Mainnet);
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
    expect(rate).toBe(null);
  });
});

describe.withFork(
  { blockNumber: 16605421, network: 'mainnet', useTokens: false },
  'Fetch Oracle Rates',
  () => {
    beforeAll(async () => {
      process.env['FAKE_TIME'] = '1676210417';
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
      const path = OracleRegistry.findPath('cETH', 'cUSDC', Network.Mainnet);
      const rate = OracleRegistry.getLatestFromPath(Network.Mainnet, path);

      expect(rate).toBeDefined();
      expect(ethers.utils.formatUnits(rate!.rate, 9)).toBe('1341.740810123');
      expect(rate!.base).toBe('cETH');
      expect(rate!.quote).toBe('cUSDC');
    });

    it('subscribes to an oracle path', (done) => {
      const path = OracleRegistry.findPath('ETH', 'USD', Network.Mainnet);
      let subCalls = 0;
      OracleRegistry.subscribeToPath(Network.Mainnet, path).subscribe(
        (rates) => {
          subCalls += 1;
          expect(rates?.rate.toNumber()).toBe(1519321584080);
          expect(rates?.base).toBe('ETH');
          expect(rates?.quote).toBe('USD');
          if (subCalls == 2) done();
        }
      );

      OracleRegistry.fetchOracleData(Network.Mainnet, provider);
    }, 10_0000);

    it('returns the latest value from a single oracle', () => {
      const latest = OracleRegistry.getLatestFromOracle(
        Network.Mainnet,
        'ETH/USD:0'
      );
      expect(latest?.rate.toNumber()).toBe(1519321584080);
      expect(latest?.base).toBe('ETH');
      expect(latest?.quote).toBe('USD');
    });

    it('subscribes to a single oracle', (done) => {
      OracleRegistry.subscribeToOracle(Network.Mainnet, 'ETH/USD:0').subscribe(
        (rate) => {
          expect(rate?.rate.toNumber()).toBe(1519321584080);
          expect(rate?.base).toBe('ETH');
          expect(rate?.quote).toBe('USD');
          done();
        }
      );
    });

    it('blocks and timestamps update in cache', (done) => {
      const jsonMap = OracleRegistry.serializeToCache(Network.Mainnet);
      const data = JSON.parse(jsonMap);
      data['lastUpdateBlock'] += 1;
      fetchMock.mockResponseOnce(JSON.stringify(data));

      OracleRegistry.subscribeLastUpdateBlock(Network.Mainnet)?.subscribe(
        (block) => {
          // Receives two updates here, one is the initial block and the the
          // next one will be the correct block
          if (block < 16605422) return;
          expect(block).toBe(16605422);
          done();
        }
      );

      OracleRegistry.fetchFromCache(Network.Mainnet);
    });

    it('exchange rates update in cache', (done) => {
      const jsonMap = OracleRegistry.serializeToCache(Network.Mainnet);
      const data = JSON.parse(jsonMap);
      data['values'][0][1]['rate'] = BigNumber.from(1).toJSON();
      fetchMock.mockResponseOnce(JSON.stringify(data));

      let updates = 0;
      OracleRegistry.subscribeToOracle(Network.Mainnet, 'WBTC/BTC:0').subscribe(
        (rate) => {
          updates += 1;
          if (updates == 2) {
            expect(rate?.rate.toNumber()).toBe(1);
            expect(rate?.base).toBe('WBTC');
            expect(rate?.quote).toBe('BTC');
            done();
          }
        }
      );

      OracleRegistry.fetchFromCache(Network.Mainnet);
    });
  }
);
