import { Network } from '@notional-finance/util';
import { AccountFetchMode } from '../../src/client/account-registry-client';
import { Registry } from '../../src/Registry';

describe('Sync Analytics', () => {
  beforeAll((done) => {
    Registry.initialize(
      'https://data-dev.notional.finance',
      AccountFetchMode.SINGLE_ACCOUNT_DIRECT
    );
    Registry.startRefresh(Network.arbitrum);
    Registry.getAnalyticsRegistry().onNetworkRegistered(Network.arbitrum, () =>
      done()
    );
  }, 8000);

  it('can sync views', async () => {
    const analytics = Registry.getAnalyticsRegistry();
    // expect(analytics.getAssetVolatility(Network.arbitrum));
    // expect(analytics.getHistoricalPrices(Network.arbitrum));
    // expect(analytics.getNTokenTradingFees(Network.arbitrum)).toBeDefined();
    // console.log(
    //   analytics.getHistoricalOracles(Network.arbitrum, 1688342400)
    // );
    // console.log(analytics.getAssetHistory(Network.arbitrum));
    console.info(await analytics.getView(Network.arbitrum, 'accounts_list'));
  });

  it('can fetch vaults views', () => {
    const analytics = Registry.getAnalyticsRegistry();
    expect(
      analytics.getVault(
        Network.arbitrum,
        '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf'
      )
    ).toBeDefined();
  });

  afterAll(() => {
    Registry.stopRefresh(Network.arbitrum);
  });
});
