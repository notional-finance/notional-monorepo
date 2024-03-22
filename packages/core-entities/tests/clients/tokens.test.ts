import {
  AssetType,
  encodeERC1155Id,
  Network,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import {
  AccountFetchMode,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '../../src';
import { OracleRegistryClient, TokenRegistryClient } from '../../src/client';
import { BigNumber } from 'ethers';

const ETH_PRICE = 1840.282196;
describe.withRegistry(
  {
    network: Network.arbitrum,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Token Registry',
  () => {
    let tokens: TokenRegistryClient;
    let oracles: OracleRegistryClient;

    beforeAll((done) => {
      tokens = Registry.getTokenRegistry();
      oracles = Registry.getOracleRegistry();
      tokens.onNetworkRegistered(Network.all, () => {
        done();
      });
    });

    it('gets all tokens', () => {
      expect(tokens.getAllTokens(Network.arbitrum).length).toBeGreaterThan(
        50
      );
    });

    it('finds token by address', () => {
      expect(
        tokens.getTokenByAddress(Network.arbitrum, ZERO_ADDRESS)?.name
      ).toBe('Ether');
    });

    it('finds tokens by symbol', () => {
      expect(
        tokens.getTokenBySymbol(Network.arbitrum, 'USDC')?.address
      ).toBe('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8');
    });

    it('finds tokens by id', () => {
      const id = encodeERC1155Id(6, 1695168000, AssetType.FCASH_ASSET_TYPE);
      expect(tokens.getTokenByID(Network.arbitrum, id).name).toBe(
        'fFRAX Maturing 1695168000'
      );
    });

    it('allows a custom token to be registered', () => {
      const t = tokens.getTokenBySymbol(Network.arbitrum, 'wstETH')!;

      tokens.registerToken({
        ...t,
        symbol: 'PEPE',
        id: '0x123',
      });

      expect(tokens.getTokenByID(Network.arbitrum, '0x123').symbol).toBe(
        'PEPE'
      );
    });

    it('parses an input into a token balance instance', () => {
      const tb = tokens.parseInputToTokenBalance(
        '1000',
        'USDC',
        Network.arbitrum
      );
      expect(tb.toDisplayStringWithSymbol()).toBe('1,000.000 USDC');
    });

    describe('Token Balance', () => {
      it('throws errors on mismatches', () => {
        const tb1 = TokenBalance.zero(
          tokens.getTokenBySymbol(Network.arbitrum, 'USDC')!
        );
        const tb2 = TokenBalance.zero(
          tokens.getTokenBySymbol(Network.arbitrum, 'DAI')!
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
          Network.arbitrum
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

      it('can convert between tokens', () => {
        const eth = tokens.parseInputToTokenBalance(
          '1',
          'ETH',
          Network.arbitrum
        );

        expect(
          eth
            .toToken(tokens.getTokenBySymbol(Network.arbitrum, 'USDC'))
            .toFloat()
        ).toBeCloseTo(ETH_PRICE);
      });

      it('can convert prime cash to underlying tokens', () => {
        const peth = tokens.parseInputToTokenBalance(
          '1',
          'pETH',
          Network.arbitrum
        );

        expect(
          peth.toUnderlying().toDisplayStringWithSymbol(8)
        ).toMatchSnapshot();
      });
    });

    describe('Exchange Rates', () => {
      it('[FORWARD] can find a path from eth => usdc', () => {
        const eth = tokens.getTokenBySymbol(Network.arbitrum, 'ETH')!;
        const usdc = tokens.getTokenBySymbol(Network.arbitrum, 'USDC')!;
        const path = oracles.findPath(eth.id, usdc.id, Network.arbitrum);
        expect(path).toEqual([eth.id, usdc.id]);
        const value = oracles.getLatestFromPath(Network.arbitrum, path);
        expect(oracles.formatNumber(value!)).toBeCloseTo(ETH_PRICE);
      });

      it('[REVERSE] can find a path from usdc => eth', () => {
        const eth = tokens.getTokenBySymbol(Network.arbitrum, 'ETH')!;
        const usdc = tokens.getTokenBySymbol(Network.arbitrum, 'USDC')!;
        const path = oracles.findPath(usdc.id, eth.id, Network.arbitrum);
        expect(path).toEqual([usdc.id, eth.id]);

        const value = oracles.getLatestFromPath(Network.arbitrum, path);
        expect(oracles.formatNumber(oracles.invertRate(value!))).toBeCloseTo(
          ETH_PRICE
        );
      });

      it('[MULTIHOP] can find a path from wsteth => wbtc', () => {
        const wsteth = tokens.getTokenBySymbol(Network.arbitrum, 'wstETH')!;
        const wbtc = tokens.getTokenBySymbol(Network.arbitrum, 'WBTC')!;
        const path = oracles.findPath(wbtc.id, wsteth.id, Network.arbitrum);

        const value = oracles.getLatestFromPath(Network.arbitrum, path);
        expect(oracles.formatNumber(value!)).toMatchSnapshot();
      });

      it('[MULTIHOP] can find a path from fusdc => fdai', () => {
        const fusdc = tokens.getTokenByID(
          Network.arbitrum,
          encodeERC1155Id(3, 1695168000, AssetType.FCASH_ASSET_TYPE)
        );
        const fdai = tokens.getTokenByID(
          Network.arbitrum,
          encodeERC1155Id(2, 1695168000, AssetType.FCASH_ASSET_TYPE)
        );
        const path = oracles.findPath(fusdc.id, fdai.id, Network.arbitrum);

        const value = oracles.getLatestFromPath(Network.arbitrum, path);
        expect(oracles.formatNumber(value!)).toBeCloseTo(0.999);
      });

      it('can convert prime cash to fiat currency', () => {
        const pusdc = tokens.parseInputToTokenBalance(
          '1',
          'pUSDC',
          Network.arbitrum
        );

        expect(
          pusdc.toFiat('JPY').toDisplayStringWithSymbol(8)
        ).toMatchSnapshot();
      });

      it('can note to fiat currency', () => {
        const NOTE = tokens.parseInputToTokenBalance(
          '1',
          'NOTE',
          Network.arbitrum
        );

        expect(
          NOTE.toFiat('USD').toDisplayStringWithSymbol(8)
        ).toMatchSnapshot();

        const eth = tokens.getTokenBySymbol(Network.arbitrum, 'ETH')!;
        const wbtc = tokens.getTokenBySymbol(Network.arbitrum, 'WBTC')!;
        expect(
          NOTE.toToken(eth).toDisplayStringWithSymbol(8)
        ).toMatchSnapshot();
        expect(
          NOTE.toToken(wbtc).toDisplayStringWithSymbol(8)
        ).toMatchSnapshot();
      });
    });

    describe('Risk Adjusted', () => {
      let ETH: TokenDefinition;
      let USDC: TokenDefinition;
      let FRAX: TokenDefinition;

      beforeAll(() => {
        ETH = tokens.getTokenBySymbol(Network.arbitrum, 'ETH');
        USDC = tokens.getTokenBySymbol(Network.arbitrum, 'USDC');
        FRAX = tokens.getTokenBySymbol(Network.arbitrum, 'FRAX');
      });

      /** NOTE: ETH risk adjustments must be applied manually */

      it('Neg USDC to ETH', () => {
        const riskAdjusted = TokenBalance.fromFloat(-ETH_PRICE, USDC).toToken(
          ETH,
          'Debt'
        );
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`-1.090 ETH`);
      });

      it('Pos USDC to ETH', () => {
        const riskAdjusted = TokenBalance.fromFloat(ETH_PRICE, USDC).toToken(
          ETH,
          'Asset'
        );
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`0.920 ETH`);
      });

      it('Pos FRAX to ETH', () => {
        const riskAdjusted = TokenBalance.fromFloat(ETH_PRICE, FRAX).toToken(
          ETH,
          'Asset'
        );
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`0.000 ETH`);
      });

      it('Neg fUSDC to USDC', () => {
        const fusdc = tokens.getTokenByID(
          Network.arbitrum,
          encodeERC1155Id(3, 1695168000, AssetType.FCASH_ASSET_TYPE)
        );
        const usdc = TokenBalance.fromFloat(-1, fusdc);
        const riskAdjusted = usdc.toRiskAdjustedUnderlying();
        const underlying = usdc.toUnderlying();
        expect(riskAdjusted).toLtTB(underlying);
        expect(riskAdjusted.isNegative()).toBe(true);
      });

      it('Pos fUSDC to USDC', () => {
        const fusdc = tokens.getTokenByID(
          Network.arbitrum,
          encodeERC1155Id(3, 1695168000, AssetType.FCASH_ASSET_TYPE)
        );
        const usdc = TokenBalance.unit(fusdc);
        const riskAdjusted = usdc.toRiskAdjustedUnderlying();
        const underlying = usdc.toUnderlying();
        expect(riskAdjusted).toLtTB(underlying);
        expect(riskAdjusted.isPositive()).toBe(true);
      });

      it('nUSDC to USDC', () => {
        const nUSDC = tokens.getTokenBySymbol(Network.arbitrum, 'nUSDC');
        const usdc = TokenBalance.unit(nUSDC);
        const riskAdjusted = usdc.toRiskAdjustedUnderlying();
        const underlying = usdc.toUnderlying();
        expect(riskAdjusted).toLtTB(underlying);
        expect(riskAdjusted.isPositive()).toBe(true);
      });
    });
  }
);
