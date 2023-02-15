import { Network, ExchangeRegistry } from '../../src';

describe.withFork(
  { blockNumber: 16605421, network: 'mainnet' },
  'pool cache',
  () => {
    beforeAll(async () => {
      // Initializes all internal pool data
      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);
    });

    it('updates pool data via the cache', (done) => {
      const rawString = ExchangeRegistry.serializeToCache(Network.Mainnet);
      const data = JSON.parse(rawString);
      const poolAddress = data['values'][0][0];
      data['values'][0][1]['totalSupply']['hex'] = '0x00';

      ExchangeRegistry.subscribePoolInstance(
        Network.Mainnet,
        poolAddress
      )?.subscribe((basePool) => {
        if (basePool?.totalSupply.isZero()) done();
      });

      ExchangeRegistry.fetchFromCache(Network.Mainnet, JSON.stringify(data));
    });
  }
);
