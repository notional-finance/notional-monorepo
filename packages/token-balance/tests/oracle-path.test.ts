import { OracleRegistry } from '../src/registry/OracleRegistry';

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
