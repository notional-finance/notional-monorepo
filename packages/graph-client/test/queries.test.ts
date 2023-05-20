import GraphClient from '../src';
import Currency from '../src/queries/currency';
import Account from '../src/queries/account';
import DailyLendBorrowVolumes from '../src/queries/daily-lend-borrow-volume';

describe('it runs graphql queries', () => {
  it('can query currencies', async () => {
    const mainnet = GraphClient.getClient('mainnet/notional', 0);
    const result = await mainnet.queryOrThrow(Currency);
    expect(result).toBeDefined();
  });

  it('can query an account', async () => {
    const mainnet = GraphClient.getClient('mainnet/notional', 0);
    const result = await mainnet.queryOrThrow(Account);
    expect(result).toBeDefined();
  });

  it('can query daily lend borrow volumes', async () => {
    const mainnet = GraphClient.getClient('mainnet/notional', 0);
    const result = await mainnet.queryOrThrow(DailyLendBorrowVolumes);
    expect(result).toBeDefined();
  });
});
