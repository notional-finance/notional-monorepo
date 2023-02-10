import { OracleRegistry } from '../src/oracles/OracleRegistry';

class MockOracleRegistry extends OracleRegistry {
  public static search(
    quote: string,
    base: string,
    adjList: Map<string, Set<string>>
  ): string[] {
    return this.breadthFirstSearch(quote, base, adjList);
  }
}

describe('Oracle Path', () => {
  const adjList = new Map<string, Set<string>>();
  adjList.set('ETH', new Set<string>(['COMP', 'BAL', 'stETH', 'cETH']));
  adjList.set('USD', new Set<string>(['ETH', 'USDC', 'DAI', 'BTC', 'FRAX']));
  adjList.set('USDC', new Set<string>(['cUSDC']));
  adjList.set('BTC', new Set<string>(['WBTC']));

  Array.from(adjList.keys()).forEach((k) => {
    (adjList.get(k) || []).forEach((v) => {
      const list = adjList.get(v) || new Set<string>();
      list.add(k);
      adjList.set(v, list);
    });
  });

  it.todo('creates a complete adjacency list of oracles');

  // TODO: switch these to use "findPath"
  it('[SINGLE] can find a path from usd => eth', () => {
    const path = MockOracleRegistry.search('USD', 'ETH', adjList);
    expect(path).toEqual(['USD', 'ETH']);

    expect(MockOracleRegistry.search('ETH', 'USD', adjList)).toEqual(
      path.reverse()
    );
  });

  it('[MULTIHOP] can find a path from cUSDC => cETH', () => {
    const path = MockOracleRegistry.search('cETH', 'cUSDC', adjList);
    expect(path).toEqual(['cETH', 'ETH', 'USD', 'USDC', 'cUSDC']);

    expect(MockOracleRegistry.search('cUSDC', 'cETH', adjList)).toEqual(
      path.reverse()
    );
  });

  it('[ERROR] throws on an unknown path', () => {
    expect(() =>
      MockOracleRegistry.search('eETH', 'USD', adjList)
    ).toThrowError('Path from USD to eETH not found');
  });
});

describe('Fetch Oracle Rates', () => {
  // TODO: use a snapshot test here on a fixed block
  it.todo('generates aggregate calls and fetches oracle rates');

  it.todo('returns the latest value from an oracle path');
  it.todo('returns undefined if the oracle path is not complete');
  it.todo('returns the latest value from a single oracle');
  it.todo('subscribes to an oracle path');
  it.todo('subscribes to a single oracle');
  it.todo('subscribes to update blocks');
});
