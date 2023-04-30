import { BalancerPoolHarness } from './harness/BalancerPoolHarness';
import { Network, ExchangeRegistry } from '../../src';
import { BaseLiquidityPool } from '../../src/exchanges';
import { PoolTestHarness } from './harness/PoolTestHarness';

describe.withFork({ blockNumber: 17134339, network: 'mainnet' }, 'test', () => {
  jest.setTimeout(60000);

  // Create matching Pool Harness
  const allPools = ExchangeRegistry.getAllPools(Network.Mainnet);

  console.log(JSON.stringify(allPools));

  beforeAll(async () => {
    // Initializes all internal pool data
    await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);
  });

  it('test v1 pool', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[1]);

    if (pool) {
      console.log(pool.balances.map((r) => r.n.toString()));
      console.log(pool.totalSupply.n.toString());
      console.log(JSON.stringify(pool.poolParams));
    }
  });

  it('test v2 pool', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[2]);

    if (pool) {
      console.log(pool.balances.map((r) => r.n.toString()));
      console.log(pool.totalSupply.n.toString());
      console.log(JSON.stringify(pool.poolParams));
    }
  });
});
