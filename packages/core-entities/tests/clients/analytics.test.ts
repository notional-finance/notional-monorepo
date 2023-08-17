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
  beforeAll((done) => {
    Registry.initialize(
      'https://data-dev.notional.finance',
      AccountFetchMode.SINGLE_ACCOUNT_DIRECT
    );
    Registry.startRefresh(Network.ArbitrumOne);
    Registry.getAnalyticsRegistry().onNetworkRegistered(
      Network.ArbitrumOne,
      () => done()
    );
  }, 8000);

  it('can sync views', () => {
    const analytics = Registry.getAnalyticsRegistry();
    // expect(analytics.getAssetVolatility(Network.ArbitrumOne));
    // expect(analytics.getHistoricalPrices(Network.ArbitrumOne));
    expect(analytics.getNTokenTradingFees(Network.ArbitrumOne)).toBeDefined();
    // console.log(analytics.getAssetHistory(Network.ArbitrumOne));
  });

  it('can fetch vaults views', () => {
    const analytics = Registry.getAnalyticsRegistry();
    console.log(analytics.getAllSubjectKeys(Network.ArbitrumOne));
    console.log(
      analytics.getVault(
        Network.ArbitrumOne,
        '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf'
      )
    );
  });

  afterAll(() => {
    Registry.stopRefresh(Network.ArbitrumOne);
  });
});
