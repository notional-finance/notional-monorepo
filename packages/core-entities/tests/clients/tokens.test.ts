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

const ETH_PRICE = 1798.536;
describe.withRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Token Registry',
  () => {
    let tokens: TokenRegistryClient;
    let oracles: OracleRegistryClient;

    beforeAll(async () => {
      tokens = Registry.getTokenRegistry();
      oracles = Registry.getOracleRegistry();
    });

    it('gets all tokens', () => {
      expect(tokens.getAllTokens(Network.ArbitrumOne).length).toBe(54);
    });

    it('finds token by address', () => {
      expect(
        tokens.getTokenByAddress(Network.ArbitrumOne, ZERO_ADDRESS)?.name
      ).toBe('Ether');
    });

    it('finds tokens by symbol', () => {
      expect(
        tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')?.address
      ).toBe('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8');
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

      it('can convert between tokens', () => {
        const eth = tokens.parseInputToTokenBalance(
          '1',
          'ETH',
          Network.ArbitrumOne
        );

        expect(
          eth
            .toToken(tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC'))
            .toFloat()
        ).toBeCloseTo(ETH_PRICE);
      });

      it('can convert prime cash to underlying tokens', () => {
        const peth = tokens.parseInputToTokenBalance(
          '1',
          'pEther',
          Network.ArbitrumOne
        );

        expect(peth.toUnderlying().toDisplayStringWithSymbol(8)).toBe(
          '1.00000000 ETH'
        );
      });
    });

    describe('Exchange Rates', () => {
      it('[FORWARD] can find a path from eth => usdc', () => {
        const eth = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH')!;
        const usdc = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')!;
        const path = oracles.findPath(eth.id, usdc.id, Network.ArbitrumOne);
        expect(path).toEqual([eth.id, usdc.id]);
        const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
        expect(oracles.formatNumber(value!)).toBeCloseTo(ETH_PRICE);
      });

      it('[REVERSE] can find a path from usdc => eth', () => {
        const eth = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH')!;
        const usdc = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC')!;
        const path = oracles.findPath(usdc.id, eth.id, Network.ArbitrumOne);
        expect(path).toEqual([usdc.id, eth.id]);

        const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
        expect(oracles.formatNumber(oracles.invertRate(value!))).toBeCloseTo(
          ETH_PRICE
        );
      });

      it('[MULTIHOP] can find a path from wsteth => wbtc', () => {
        const wsteth = tokens.getTokenBySymbol(Network.ArbitrumOne, 'wstETH')!;
        const wbtc = tokens.getTokenBySymbol(Network.ArbitrumOne, 'WBTC')!;
        const path = oracles.findPath(wbtc.id, wsteth.id, Network.ArbitrumOne);

        const value = oracles.getLatestFromPath(Network.ArbitrumOne, path);
        expect(oracles.formatNumber(value!)).toBeCloseTo(13.253);
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

    describe('Risk Adjusted', () => {
      let ETH: TokenDefinition;
      let USDC: TokenDefinition;
      let FRAX: TokenDefinition;
      beforeAll(() => {
        ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
        USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
        FRAX = tokens.getTokenBySymbol(Network.ArbitrumOne, 'FRAX');
      });

      it('ETH Asset', () => {
        const eth = TokenBalance.fromFloat(1, ETH);
        const riskAdjusted = eth.toRiskAdjustedUnderlying();
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`0.810 ETH`);
      });

      it('ETH Debt', () => {
        const eth = TokenBalance.fromFloat(-1, ETH);
        const riskAdjusted = eth.toRiskAdjustedUnderlying();
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`-1.240 ETH`);
      });

      it('Neg USDC to ETH', () => {
        const riskAdjusted = TokenBalance.fromFloat(-ETH_PRICE, USDC)
          .toRiskAdjustedUnderlying()
          .toToken(ETH);
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`-1.090 ETH`);
      });

      it('Pos USDC to ETH', () => {
        const riskAdjusted = TokenBalance.fromFloat(ETH_PRICE, USDC)
          .toRiskAdjustedUnderlying()
          .toToken(ETH);
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`0.920 ETH`);
      });

      it('Pos FRAX to ETH', () => {
        const riskAdjusted = TokenBalance.fromFloat(ETH_PRICE, FRAX)
          .toRiskAdjustedUnderlying()
          .toToken(ETH);
        expect(riskAdjusted.toDisplayStringWithSymbol(3)).toBe(`0.000 ETH`);
      });

      it('Neg fUSDC to USDC', () => {
        const fusdc = tokens.getTokenByID(
          Network.ArbitrumOne,
          encodeERC1155Id(3, 1695168000, AssetType.FCASH_ASSET_TYPE)
        );
        const usdc = TokenBalance.fromFloat(-1, fusdc);
        const riskAdjusted = usdc.toRiskAdjustedUnderlying();
        expect(riskAdjusted.toFloat()).toBeCloseTo(-1.09);
      });

      it('Pos fUSDC to USDC', () => {
        const fusdc = tokens.getTokenByID(
          Network.ArbitrumOne,
          encodeERC1155Id(3, 1695168000, AssetType.FCASH_ASSET_TYPE)
        );
        const usdc = TokenBalance.unit(fusdc);
        const riskAdjusted = usdc.toRiskAdjustedUnderlying();
        expect(riskAdjusted.toFloat()).toBeCloseTo(0.9016);
      });

      it('nUSDC to USDC', () => {
        const nUSDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'nUSDC');
        const usdc = TokenBalance.unit(nUSDC);
        const riskAdjusted = usdc.toRiskAdjustedUnderlying();
        expect(riskAdjusted.toFloat()).toBeCloseTo(0.83);
      });
    });
  }
);
