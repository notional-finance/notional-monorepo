import { BalancerPoolHarness } from './harness/BalancerPoolHarness';
import { Network, ExchangeRegistry } from '../../src';
import { BaseLiquidityPool } from '../../src/exchanges';
import { PoolTestHarness } from './harness/PoolTestHarness';

describe.withFork(
  { blockNumber: 16605421, network: 'mainnet' },
  'pool acceptance tests',
  () => {
    // Create matching Pool Harness
    const allPools = ExchangeRegistry.getAllPools(Network.Mainnet);

    beforeAll(async () => {
      // Initializes all internal pool data
      await ExchangeRegistry.fetchPoolData(Network.Mainnet, provider);
    });

    describe.each(allPools)(
      'DEX Acceptance Testing',
      (address) => {
        let harness: PoolTestHarness;
        let basePool: BaseLiquidityPool<unknown>;
        const tokenIndexes: number[] = [0, 1];

        beforeAll(async () => {
          // @todo balancer pool harness needs to change, should the pool harness be part of the exchange
          // registry?
          harness = await BalancerPoolHarness.makePoolHarness(
            Network.Mainnet,
            address
          );
          const _basePool = ExchangeRegistry.getPoolInstance(
            Network.Mainnet,
            address
          );
          if (!_basePool) throw Error(`Base Pool for ${address} not found`);
          basePool = _basePool;
        });

        // @todo test both sides of pools
        it.each(tokenIndexes)('calculates trades', async (tokenIndex) => {
          // @todo calculate trades for 0.25%, 1%, 5% of the pool on both sides of the pool
          const tokensIn = basePool.balances[tokenIndex].copy(
            basePool.balances[tokenIndex].decimals
          );

          const { tokensOut, feesPaid: _feesPaid } =
            basePool.calculateTokenTrade(tokensIn, tokenIndex, 1 - tokenIndex);

          const actual = await harness.trade(
            signer,
            tokensIn.n,
            tokenIndex,
            1 - tokenIndex
          );

          expect(tokensOut).toBeApprox(tokensOut.copy(actual.tokensOut));
          // @todo harness does not log fees paid
          // feesPaid.forEach((f, i) => {
          //   expect(f).toBeApprox(f.copy(actual.feesPaid[i]));
          // });
        });

        it.each(tokenIndexes)(
          'calculates single sided entry and exit',
          async (tokenIndexIn) => {
            // One unit of zero token in
            const tokensIn = basePool.balances.map((b) => b.copy(0));
            tokensIn[tokenIndexIn] = tokensIn[tokenIndexIn].copy(
              tokensIn[tokenIndexIn].decimals
            );

            const { lpTokens, feesPaid: feesPaidIn } =
              basePool.getLPTokensGivenTokens(tokensIn);

            const actualIn = await harness.singleSideEntry(
              signer,
              tokenIndexIn,
              tokensIn[tokenIndexIn].n
            );
            expect(lpTokens).toBeApprox(lpTokens.copy(actualIn.lpTokens));
            feesPaidIn.forEach((f, i) => {
              expect(f).toBeApprox(f.copy(actualIn.feesPaid[i]));
            });

            const { tokensOut, feesPaid: _feesPaidOut } =
              basePool.getTokensOutGivenLPTokens(lpTokens, tokenIndexIn);

            const actualOut = await harness.singleSideExit(
              signer,
              tokenIndexIn,
              actualIn.lpTokens
            );

            tokensOut.forEach((t, i) => {
              if (i === tokenIndexIn) {
                expect(t).toBeApprox(t.copy(actualOut.tokensOut), 1e-6);
              } else {
                expect(t.isZero()).toBe(true);
              }
            });

            // @todo protocol fees are disabled...
            // feesPaidOut.forEach((f, i) => {
            //   expect(f).toBeApprox(f.copy(actualOut.feesPaid[i]));
            // });
          },
          10_000
        );

        it('calculates balanced entry and exit', async () => {
          const tokensIn = basePool.balances.map((b) => b.scale(1, 10_0000));

          const { lpTokens, feesPaid: feesPaidIn } =
            basePool.getLPTokensGivenTokens(tokensIn);

          const actualIn = await harness.multiTokenEntry(
            signer,
            tokensIn.map((t) => t.n)
          );
          expect(lpTokens).toBeApprox(lpTokens.copy(actualIn.lpTokens));
          feesPaidIn.forEach((f, i) => {
            expect(f).toBeApprox(f.copy(actualIn.feesPaid[i]));
          });

          const { tokensOut, feesPaid: feesPaidOut } =
            basePool.getTokensOutGivenLPTokens(lpTokens);
          const actualOut = await harness.multiTokenExit(
            signer,
            actualIn.lpTokens
          );

          tokensOut.forEach((t, i) => {
            expect(t).toBeApprox(t.copy(actualOut.tokensOut[i]));
          });
          feesPaidOut.forEach((f, i) => {
            expect(f).toBeApprox(f.copy(actualOut.feesPaid[i]));
          });
        }, 10_000);

        // it.todo('calculates unbalanced entry and exit');
        // it.todo('calculates a price exposure table');
      },
      20_000
    );
  }
);
