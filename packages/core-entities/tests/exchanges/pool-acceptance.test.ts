import { Registry } from '../../src/registry';
import { Network } from '@notional-finance/util';
import { PoolTestHarness, TestConfig } from './harness';
import httpserver from 'http-server';
import { BaseLiquidityPool } from 'packages/core-entities/src/exchanges';

const server = httpserver.createServer({
  root: `${__dirname}/../clients/__snapshots__`,
});

process.env['FAKE_TIME'] = '1683741880';

describe('Pool Tests', () => {
  // Start and stop cache server
  beforeAll(async () => {
    Registry.initialize('http://localhost:9999');
    await new Promise<void>((resolve) => {
      server.listen(9999, () => {
        resolve();
      });
    });
    Registry.startRefresh(Network.ArbitrumOne);
  });

  afterAll(() => {
    Registry.stopRefresh(Network.ArbitrumOne);
    server.close();
  });

  describe.withFork(
    { blockNumber: 89337451, network: Network.ArbitrumOne },
    'Arbitrum Pool Tests',
    () => {
      describe.each(TestConfig[Network.ArbitrumOne])(
        'Acceptance',
        ({ address, Harness }) => {
          let harness: PoolTestHarness<BaseLiquidityPool<unknown>>;
          const tokenIndexes: number[] = [0, 1, 2, 3, 4];

          beforeAll((done) => {
            Registry.getExchangeRegistry().onSubjectKeyReady(
              Network.ArbitrumOne,
              address,
              () => {
                harness = new Harness(Network.ArbitrumOne, address, provider);
                done();
              }
            );
          });

          it.todo('calculates single side entry and exit');

          //it.each(tokenIndexes)('calculates trades', async (tokenIndex) => {
          it('calculates trades', async () => {
            const tokenIndex = 0;
            if (tokenIndex >= harness.poolInstance.balances.length) return;

            try {
              const tokensIn =
                harness.poolInstance.balances[tokenIndex].mulInRatePrecision(
                  0.01e9
                );

              const actual = await harness.trade(
                signer,
                tokensIn,
                tokenIndex,
                1 - tokenIndex
              );
              console.log(
                'actual',
                tokensIn.toDisplayStringWithSymbol(8),
                actual.tokensOut.toDisplayStringWithSymbol(8)
              );
              const { tokensOut, feesPaid: _feesPaid } =
                harness.poolInstance.calculateTokenTrade(
                  tokensIn,
                  tokenIndex,
                  1 - tokenIndex
                );
              console.log('calculated', tokensOut.toDisplayStringWithSymbol(8));
              expect(tokensOut).toBeApprox(actual.tokensOut);
            } catch (e) {
              if ((e as Error).name === 'UnimplementedPoolMethod') return;
              throw e;
            }
          });

          it.todo('calculates balanced entry and exit');
          it.todo('calculates unbalanced entry and exit');
        }
      );
    }
  );

  // describe.withFork(
  //   { blockNumber: 16605421, network: Network.Mainnet },
  //   'Mainnet Pool Tests',
  //   () => {}
  // );
});

// describe.withFork(
//   { blockNumber: 16605421, network: 'mainnet' },
//   'pool acceptance tests',
//   () => {
//     describe.each(allPools)(
//       'DEX Acceptance Testing',
//       (address) => {
//         let harness: PoolTestHarness;
//         let basePool: BaseLiquidityPool<unknown>;
//         const tokenIndexes: number[] = [0, 1];

//         // @todo test both sides of pools
//         it.each(tokenIndexes)('calculates trades', async (tokenIndex) => {
//           // @todo calculate trades for 0.25%, 1%, 5% of the pool on both sides of the pool
//           const tokensIn = basePool.balances[tokenIndex].copy(
//             basePool.balances[tokenIndex].decimals
//           );

//           const { tokensOut, feesPaid: _feesPaid } =
//             basePool.calculateTokenTrade(tokensIn, tokenIndex, 1 - tokenIndex);

//           const actual = await harness.trade(
//             signer,
//             tokensIn.n,
//             tokenIndex,
//             1 - tokenIndex
//           );

//           expect(tokensOut).toBeApprox(tokensOut.copy(actual.tokensOut));
//           // @todo harness does not log fees paid
//           // feesPaid.forEach((f, i) => {
//           //   expect(f).toBeApprox(f.copy(actual.feesPaid[i]));
//           // });
//         });

//         it.each(tokenIndexes)(
//           'calculates single sided entry and exit',
//           async (tokenIndexIn) => {
//             // One unit of zero token in
//             const tokensIn = basePool.balances.map((b) => b.copy(0));
//             tokensIn[tokenIndexIn] = tokensIn[tokenIndexIn].copy(
//               tokensIn[tokenIndexIn].decimals
//             );

//             const { lpTokens, feesPaid: feesPaidIn } =
//               basePool.getLPTokensGivenTokens(tokensIn);

//             const actualIn = await harness.singleSideEntry(
//               signer,
//               tokenIndexIn,
//               tokensIn[tokenIndexIn].n
//             );
//             expect(lpTokens).toBeApprox(lpTokens.copy(actualIn.lpTokens));
//             feesPaidIn.forEach((f, i) => {
//               expect(f).toBeApprox(f.copy(actualIn.feesPaid[i]));
//             });

//             const { tokensOut, feesPaid: _feesPaidOut } =
//               basePool.getTokensOutGivenLPTokens(lpTokens, tokenIndexIn);

//             const actualOut = await harness.singleSideExit(
//               signer,
//               tokenIndexIn,
//               actualIn.lpTokens
//             );

//             tokensOut.forEach((t, i) => {
//               if (i === tokenIndexIn) {
//                 expect(t).toBeApprox(t.copy(actualOut.tokensOut), 1e-6);
//               } else {
//                 expect(t.isZero()).toBe(true);
//               }
//             });

//             // @todo protocol fees are disabled...
//             // feesPaidOut.forEach((f, i) => {
//             //   expect(f).toBeApprox(f.copy(actualOut.feesPaid[i]));
//             // });
//           },
//           10_000
//         );

//         it('calculates balanced entry and exit', async () => {
//           const tokensIn = basePool.balances.map((b) => b.scale(1, 10_0000));

//           const { lpTokens, feesPaid: feesPaidIn } =
//             basePool.getLPTokensGivenTokens(tokensIn);

//           const actualIn = await harness.multiTokenEntry(
//             signer,
//             tokensIn.map((t) => t.n)
//           );
//           expect(lpTokens).toBeApprox(lpTokens.copy(actualIn.lpTokens));
//           feesPaidIn.forEach((f, i) => {
//             expect(f).toBeApprox(f.copy(actualIn.feesPaid[i]));
//           });

//           const { tokensOut, feesPaid: feesPaidOut } =
//             basePool.getTokensOutGivenLPTokens(lpTokens);
//           const actualOut = await harness.multiTokenExit(
//             signer,
//             actualIn.lpTokens
//           );

//           tokensOut.forEach((t, i) => {
//             expect(t).toBeApprox(t.copy(actualOut.tokensOut[i]));
//           });
//           feesPaidOut.forEach((f, i) => {
//             expect(f).toBeApprox(f.copy(actualOut.feesPaid[i]));
//           });
//         }, 10_000);

//         // it.todo('calculates unbalanced entry and exit');
//         // it.todo('calculates a price exposure table');
//       },
//       20_000
//     );
//   }
// );
