import { ERC20, ERC20ABI } from '@notional-finance/contracts';
import { BigNumber, Contract, ethers } from 'ethers';
import { Network, TokenInterface } from '../src/Definitions';
import { TokenBalance } from '../src/tokens/TokenBalance';
import { TokenRegistry } from '../src/tokens/TokenRegistry';

describe('TokenBalance', () => {
  it('creates tokens', () => {
    const tb1 = TokenBalance.zero({
      address: '0x',
      network: Network.Mainnet,
      symbol: 'USDC',
      decimalPlaces: 8,
      tokenInterface: TokenInterface.ERC20,
    });

    const tb2 = TokenBalance.zero({
      address: '0x',
      network: Network.Mainnet,
      symbol: 'USDC',
      decimalPlaces: 8,
      tokenInterface: TokenInterface.ERC20,
    });

    expect(tb1).toEqTB(tb2);
  });

  it('throws errors on mismatch', () => {
    const tb1 = TokenBalance.zero({
      address: '0x',
      network: Network.Mainnet,
      symbol: 'USDC',
      decimalPlaces: 8,
      tokenInterface: TokenInterface.ERC20,
    });

    const tb2 = TokenBalance.zero({
      address: '0x',
      network: Network.Mainnet,
      symbol: 'DAI',
      decimalPlaces: 8,
      tokenInterface: TokenInterface.ERC20,
    });

    expect(() => tb1.eq(tb2)).toThrowError();
    expect(() => tb1.lt(tb2)).toThrowError();
    expect(() => tb1.lte(tb2)).toThrowError();
    expect(() => tb1.gt(tb2)).toThrowError();
    expect(() => tb1.gte(tb2)).toThrowError();
    expect(() => tb1.add(tb2)).toThrowError();
    expect(() => tb1.sub(tb2)).toThrowError();
  });

  it('creates tokens from json', () => {
    const tb1 = TokenBalance.zero({
      address: '0x',
      network: Network.Mainnet,
      symbol: 'USDC',
      decimalPlaces: 8,
      tokenInterface: TokenInterface.ERC20,
    });
    const jsonString = JSON.stringify(tb1.json);
    const tb2 = TokenBalance.fromJSON(JSON.parse(jsonString));

    expect(tb1).toEqTB(tb2);
  });

  it('formats display strings properly across options', () => {
    const tb1 = TokenBalance.zero({
      address: '0x',
      network: Network.Mainnet,
      symbol: 'USDC',
      decimalPlaces: 8,
      tokenInterface: TokenInterface.ERC20,
    });

    expect(tb1.toDisplayString()).toBe('0.000');
    // Negative zero is truncated
    expect(tb1.copy(-1).toDisplayString()).toBe('0.000');
    // Negative and positive numbers display properly
    expect(tb1.copy(-1.23e8).toDisplayString()).toBe('-1.230');
    expect(tb1.copy(1.23e8).toDisplayString()).toBe('1.230');

    // Abbreviations work
    expect(tb1.copy(123e8).toDisplayString(2, true)).toBe('123.00');
    expect(tb1.copy(123e11).toDisplayString(2, true)).toBe('123.00k');
    expect(
      tb1.copy(BigNumber.from(10).pow(14).mul(123)).toDisplayString(2, true)
    ).toBe('123.00m');
    expect(
      tb1.copy(BigNumber.from(10).pow(15).mul(123)).toDisplayString(2, true)
    ).toBe('1.23b');
  });

  it('token registry makes balances from various strings', () => {
    const NOTE = TokenRegistry.makeBalance(
      '1,000,234',
      'NOTE',
      Network.Mainnet
    );
    expect(NOTE.toFloat()).toBe(1_000_234);
    expect(NOTE.toNumber()).toBe(1_000_234e8);
    expect(NOTE.toDisplayStringWithSymbol()).toBe('1,000,234.000 NOTE');

    const ETH = TokenRegistry.makeBalance('0.1234', 'ETH', Network.Mainnet);
    expect(ETH.toFloat()).toBe(0.1234);
    expect(ETH.toString()).toBe('123400000000000000');
    expect(ETH.toDisplayStringWithSymbol()).toBe('0.123 ETH');
  });
});

describe.withFork(
  { blockNumber: 16605421, network: 'mainnet' },
  'TokenRegistry',
  () => {
    it('all token symbols and decimals match on chain', async () => {
      const allTokens = TokenRegistry.getAllTokens(Network.Mainnet);
      const values = await Promise.all(
        allTokens
          .filter(
            (t) =>
              t.address !== ethers.constants.AddressZero &&
              (t.tokenInterface === TokenInterface.ERC20 ||
                t.tokenInterface === TokenInterface.WETH)
          )
          .map(async (t) => {
            const contract = new Contract(
              t.address,
              ERC20ABI,
              provider
            ) as ERC20;
            return {
              actualDecimals: await contract.decimals(),
              actualSymbol: await contract.symbol(),
              decimals: t.decimalPlaces,
              symbol: t.symbol,
            };
          })
      );

      values.forEach(({ actualDecimals, decimals, symbol, actualSymbol }) => {
        expect(actualDecimals).toBe(decimals);
        expect(symbol).toBe(actualSymbol);
      });
    });
  }
);
