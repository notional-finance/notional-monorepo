import { Network } from '@notional-finance/util';
import { AccountFetchMode } from '../../src/client/account-registry-client';
import { Registry } from '../../src/Registry';

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

  it('can sync views', async () => {
    const analytics = Registry.getAnalyticsRegistry();
    // expect(analytics.getAssetVolatility(Network.ArbitrumOne));
    // expect(analytics.getHistoricalPrices(Network.ArbitrumOne));
    // expect(analytics.getNTokenTradingFees(Network.ArbitrumOne)).toBeDefined();
    // console.log(
    //   analytics.getHistoricalOracles(Network.ArbitrumOne, 1688342400)
    // );
    // console.log(analytics.getAssetHistory(Network.ArbitrumOne));
    console.log(await analytics.getView(Network.ArbitrumOne, 'accounts_list'));
  });

  it('can fetch vaults views', () => {
    const analytics = Registry.getAnalyticsRegistry();
    expect(
      analytics.getVault(
        Network.ArbitrumOne,
        '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf'
      )
    ).toBeDefined();
  });

  afterAll(() => {
    Registry.stopRefresh(Network.ArbitrumOne);
  });
});
