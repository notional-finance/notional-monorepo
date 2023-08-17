import { Network } from '@notional-finance/util';
// import { AnalyticsRegistryClient } from '../../src/client/analytics-registry-client';
import { AccountFetchMode } from '../../src/client/account-registry-client';
import { Registry } from '../../src/Registry';

// describe.withForkAndRegistry(
//   {
//     network: Network.ArbitrumOne,
//     fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
//   },
//   'Sync Analytics',
//   () => {
//     it('can sync views', (done) => {

//     })
//   }
// )

describe('Sync Analytics', () => {
  it('can sync views', (done) => {
    Registry.initialize(
      'https://data-dev.notional.finance',
      AccountFetchMode.SINGLE_ACCOUNT_DIRECT
    );
    Registry.startRefresh(Network.ArbitrumOne);
    Registry.onNetworkReady(Network.ArbitrumOne, () => {
      const analytics = Registry.getAnalyticsRegistry();
      // expect(analytics.getAssetVolatility(Network.ArbitrumOne));
      // expect(analytics.getHistoricalPrices(Network.ArbitrumOne));
      // expect(analytics.getNTokenTradingFees(Network.ArbitrumOne));
      console.log(analytics.getAssetHistory(Network.ArbitrumOne));
      done();
    });
  });

  afterEach(() => {
    Registry.stopRefresh(Network.ArbitrumOne);
  });
});
