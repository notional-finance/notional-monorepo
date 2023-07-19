import { Registry } from '../../src';
import { Network } from '@notional-finance/util';
import { AccountFetchMode } from '../../src/client/account-registry-client';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Single Account',
  () => {
    it('can load a single account', (done) => {
      const accounts = Registry.getAccountRegistry();
      accounts.onAccountReady(
        Network.ArbitrumOne,
        '0xd74e7325dfab7d7d1ecbf22e6e6874061c50f243',
        (a) => {
          expect(a.address).toBe('0xd74e7325dfab7d7d1ecbf22e6e6874061c50f243');
          const nTokens = a.balances.filter((t) => t.tokenType === 'nToken');
          const underlying = a.balances.filter(
            (t) => t.tokenType === 'Underlying'
          );
          expect(nTokens.length).toBe(6);
          expect(underlying.length).toBe(6);
          expect(
            underlying.find((t) => t.token.symbol === 'ETH')
          ).toBeDefined();
          expect(a.accountHistory).toBeDefined();
          expect(
            a.balanceStatement?.filter(
              ({ token }) => token.tokenType === 'nToken'
            ).length
          ).toBe(6);
          expect(
            a.balanceStatement?.filter(
              ({ token }) => token.tokenType === 'PrimeCash'
            ).length
          ).toBe(6);
          done();
        }
      );
    });
  }
);
