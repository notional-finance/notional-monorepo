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

  it('test eth/stETH v1 pool liquidity', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[1]);

    if (pool) {
      const ethAmount = BigNumber.from('966192981919433140');
      const stETHAmount = BigNumber.from('1033871524968180711');

      const addLiquidity = pool.getLPTokensGivenTokens([
        pool.balances[0].copy(ethAmount),
        pool.balances[1].copy(stETHAmount),
      ]);

      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);

      const removeLiquidity = pool.getTokensOutGivenLPTokens(
        addLiquidity.lpTokens
      );

      expect(removeLiquidity.tokensOut[0]).toBeApprox(
        pool.balances[0].copy(ethAmount),
        1e-4
      );
      expect(removeLiquidity.tokensOut[1]).toBeApprox(
        pool.balances[1].copy(stETHAmount),
        1e-4
      );
    }
  });

  it('test eth/stETH v1 pool exchange', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[1]);

    if (pool) {
      const ethAmount = BigNumber.from('966192981919433140');
      const stETHAmount = BigNumber.from('967921763310794616');

      const trade = pool.calculateTokenTrade(
        pool.balances[0].copy(ethAmount),
        0,
        1
      );

      expect(trade.tokensOut).toBeApprox(
        pool.balances[1].copy(stETHAmount),
        1e-3
      );
    }
  });

  it('test cbETH/frxETH v2 pool liquidity', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[2]);

    if (pool) {
      const cbETHAmount = BigNumber.from('830695611202905600');
      const frxETHAmount = BigNumber.from('1173551974707159337');

      const addLiquidity = pool.getLPTokensGivenTokens([
        pool.balances[0].copy(cbETHAmount),
        pool.balances[1].copy(frxETHAmount),
      ]);

      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);

      const removeLiquidity = pool.getTokensOutGivenLPTokens(
        addLiquidity.lpTokens
      );

      expect(removeLiquidity.tokensOut[0]).toBeApprox(
        pool.balances[0].copy(cbETHAmount),
        1e-4
      );
      expect(removeLiquidity.tokensOut[1]).toBeApprox(
        pool.balances[1].copy(frxETHAmount),
        1e-4
      );
    }
  });

  it('test cbETH/frxETH v2 pool exchange', async () => {
    const pool = ExchangeRegistry.getPoolInstance(Network.Mainnet, allPools[2]);

    if (pool) {
      const cbETHAmount = BigNumber.from('830695611202905600');
      const frxETHAmount = BigNumber.from('850983050979619848');

      const trade = pool.calculateTokenTrade(
        pool.balances[0].copy(cbETHAmount),
        0,
        1
      );

      console.log(`tokenOut=${trade.tokensOut}`);

      expect(trade.tokensOut).toBeApprox(
        pool.balances[1].copy(frxETHAmount),
        1e-3
      );
    }
  });
});
