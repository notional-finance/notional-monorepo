import GraphClient from '../src';
import Currency from '../queries/currency';

describe('it runs graphql queries', () => {
  it('test', async () => {
    const mainnet = GraphClient.getClient('mainnet/notional', 0);
    const result = await mainnet.queryOrThrow(Currency);
    result.currencies.map((c) => {
      c.id;
    });
  });
});
