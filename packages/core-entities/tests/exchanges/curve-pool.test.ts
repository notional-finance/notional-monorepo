import { BalancerPoolHarness } from './harness/BalancerPoolHarness';
import { Network, ExchangeRegistry } from '../../src';
import { BaseLiquidityPool } from '../../src/exchanges';
import { PoolTestHarness } from './harness/PoolTestHarness';

describe.withFork({ blockNumber: 16605421, network: 'mainnet' }, 'test', () => {
  // Create matching Pool Harness
  const allPools = ExchangeRegistry.getAllPools(Network.Mainnet);

  console.log(JSON.stringify(allPools));

  beforeAll(async () => {
    // Initializes all internal pool data
    await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);
  });

  it('test', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[1]);

    if (pool) {
      console.log(pool.balances.map((r) => r.n.toString()));
      console.log(pool.totalSupply.n.toString());
      console.log(JSON.stringify(pool.poolParams));
    }
  });
});
