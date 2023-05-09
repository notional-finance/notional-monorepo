import {
  AssetType,
  encodeERC1155Id,
  Network,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { Registry, TokenBalance } from '../../src';
import httpserver from 'http-server';
import { OracleRegistryClient, TokenRegistryClient } from '../../src/client';
import { BigNumber } from 'ethers';

const cacheHostname = 'http://localhost:9999';
const server = httpserver.createServer({
  root: `${__dirname}/__snapshots__`,
});

process.env['FAKE_TIME'] = '1683655180';

describe('Token Registry', () => {
  let tokens: TokenRegistryClient;
  let oracles: OracleRegistryClient;

  beforeAll(async () => {
    Registry.initialize(cacheHostname);
    await new Promise<void>((resolve) => {
      server.listen(9999, () => {
        resolve();
      });
    });

    Registry.startRefresh(Network.ArbitrumOne);
    tokens = Registry.getTokenRegistry();
    oracles = Registry.getOracleRegistry();

    await new Promise<void>((resolve) => {
      tokens.subscribeNetworkRegistered().subscribe(() => {
        resolve();
      });
    });
    await new Promise<void>((resolve) => {
      oracles.subscribeNetworkRegistered().subscribe(() => {
        resolve();
      });
    });
  });

  it('gets all tokens', () => {
    expect(tokens.getAllTokens(Network.ArbitrumOne).length).toBe(49);
  });

  it('finds token by address', () => {
    expect(
      tokens.getTokenByAddress(Network.ArbitrumOne, ZERO_ADDRESS)?.name
    ).toBe('Ether');
  });

  it('finds tokens by symbol', () => {
    expect(tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')?.address).toBe(
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
    );
  });

  it('finds tokens by id', () => {
    const id = encodeERC1155Id(6, 1695168000, AssetType.FCASH_ASSET_TYPE);
    expect(tokens.getTokenByID(Network.ArbitrumOne, id).name).toBe(
      'fFRAX Maturing 1695168000'
    );
  });

  it('allows a custom token to be registered', () => {
    const t = tokens.getTokenBySymbol(Network.ArbitrumOne, 'wstETH')!;

    tokens.registerToken({
      ...t,
      symbol: 'PEPE',
      id: '0x123',
    });

    expect(tokens.getTokenByID(Network.ArbitrumOne, '0x123').symbol).toBe(
      'PEPE'
    );
  });

  it('parses an input into a token balance instance', () => {
    const tb = tokens.parseInputToTokenBalance(
      '1000',
      'USDC',
      Network.ArbitrumOne
    );
    expect(tb.toDisplayStringWithSymbol()).toBe('1,000.000 USDC');
  });

  describe('Token Balance', () => {
    it('throws errors on mismatches', () => {
      const tb1 = TokenBalance.zero(
        tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')!
      );
      const tb2 = TokenBalance.zero(
        tokens.getTokenBySymbol(Network.ArbitrumOne, 'DAI')!
      );

      expect(() => tb1.eq(tb2)).toThrowError();
      expect(() => tb1.lt(tb2)).toThrowError();
      expect(() => tb1.lte(tb2)).toThrowError();
      expect(() => tb1.gt(tb2)).toThrowError();
      expect(() => tb1.gte(tb2)).toThrowError();
      expect(() => tb1.add(tb2)).toThrowError();
      expect(() => tb1.sub(tb2)).toThrowError();
    });

    it('properly formats tokens across options', () => {
      const tb1 = tokens.parseInputToTokenBalance(
        '0',
        'USDC',
        Network.ArbitrumOne
      );
      expect(tb1.toDisplayString()).toBe('0.000');
      // Negative zero is truncated
      expect(tb1.copy(-1).toDisplayString()).toBe('0.000');
      // Negative and positive numbers display properly
      expect(tb1.copy(-1.23e6).toDisplayString()).toBe('-1.230');
      expect(tb1.copy(1.23e6).toDisplayString()).toBe('1.230');

      // Abbreviations work
      expect(tb1.copy(123e6).toDisplayString(2, true)).toBe('123.00');
      expect(tb1.copy(123e9).toDisplayString(2, true)).toBe('123.00k');
      expect(
        tb1.copy(BigNumber.from(10).pow(12).mul(123)).toDisplayString(2, true)
      ).toBe('123.00m');
      expect(
        tb1.copy(BigNumber.from(10).pow(13).mul(123)).toDisplayString(2, true)
      ).toBe('1.23b');
    });
  });

  describe('Exchange Rates', () => {
    it('[FORWARD] can find a path from usdc => eth', () => {
      const eth = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH')!;
      const usdc = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')!;
      const path = oracles.findPath(eth.id, usdc.id, Network.ArbitrumOne);
      expect(path).toEqual([eth.id, usdc.id]);
      const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
      expect(oracles.formatNumber(oracles.invertRate(value!))).toBeCloseTo(
        1842.066
      );

      // TODO: these are wrong in the snapshot
      // console.log(value?.blockNumber);
      // console.log(value?.timestamp);
    });

    it('[REVERSE] can find a path from eth => usdc', () => {
      const eth = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH')!;
      const usdc = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')!;
      const path = oracles.findPath(usdc.id, eth.id, Network.ArbitrumOne);
      expect(path).toEqual([usdc.id, eth.id]);

      const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
      expect(oracles.formatNumber(value!)).toBeCloseTo(1842.066);

      // TODO: these are wrong in the snapshot
      // console.log(value?.blockNumber);
      // console.log(value?.timestamp);
    });

    it('[MULTIHOP] can find a path from wsteth => wbtc', () => {
      const wsteth = tokens.getTokenBySymbol(Network.ArbitrumOne, 'wstETH')!;
      const wbtc = tokens.getTokenBySymbol(Network.ArbitrumOne, 'WBTC')!;
      const path = oracles.findPath(wsteth.id, wbtc.id, Network.ArbitrumOne);

      const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
      expect(oracles.formatNumber(value!)).toBeCloseTo(13.35);
    });

    it('[MULTIHOP] can find a path from fusdc => fdai', () => {
      const fusdc = tokens.getTokenByID(
        Network.ArbitrumOne,
        encodeERC1155Id(3, 1695168000, AssetType.FCASH_ASSET_TYPE)
      );
      const fdai = tokens.getTokenByID(
        Network.ArbitrumOne,
        encodeERC1155Id(2, 1695168000, AssetType.FCASH_ASSET_TYPE)
      );
      const path = oracles.findPath(fusdc.id, fdai.id, Network.ArbitrumOne);

      const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
      expect(oracles.formatNumber(value!)).toBeCloseTo(0.999);
    });
  });

  afterAll(() => {
    Registry.stopRefresh(Network.ArbitrumOne);
    server.close();
  });
});
