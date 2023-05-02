import { BalancerPoolHarness } from './harness/BalancerPoolHarness';
import { Network, ExchangeRegistry } from '../../src';
import { ethers, BigNumber } from 'ethers';
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

      const result1 = pool.getLPTokensGivenTokens([
        pool.balances[0].copy(BigNumber.from('966192981919433140')),
        pool.balances[1].copy(BigNumber.from('1033871524968180711')),
      ]);

      console.log(`lpToken=${result1.lpTokens.n.toString()}`);

      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);

      const result2 = pool.getTokensOutGivenLPTokens(result1.lpTokens);

      console.log(`tokensOut=${result2.tokensOut.map((b) => b.n.toString())}`);
    }
  });

  it('test v2 pool', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[2]);

    if (pool) {
      console.log(pool.balances.map((r) => r.n.toString()));
      console.log(pool.totalSupply.n.toString());
      console.log(JSON.stringify(pool.poolParams));

      const result1 = pool.getLPTokensGivenTokens([
        pool.balances[0].copy(BigNumber.from('830695611202905600')),
        pool.balances[1].copy(BigNumber.from('1173551974707159337')),
      ]);

      console.log(`lpToken=${result1.lpTokens.n.toString()}`);

      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);

      const result2 = pool.getTokensOutGivenLPTokens(result1.lpTokens);

      console.log(`tokensOut=${result2.tokensOut.map((b) => b.n.toString())}`);
    }
  });
});
