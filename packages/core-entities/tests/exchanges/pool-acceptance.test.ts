import { Registry } from '../../src/registry';
import { Network, RATE_PRECISION } from '@notional-finance/util';
import { PoolTestHarness, TestConfig } from './harness';
import httpserver from 'http-server';
import { BaseLiquidityPool } from 'packages/core-entities/src/exchanges';

const server = httpserver.createServer({
  root: `${__dirname}/../clients/__snapshots__`,
});

process.env['FAKE_TIME'] = '1683775701';

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
    { blockNumber: 89464974, network: Network.ArbitrumOne },
    'Arbitrum Pool Tests',
    () => {
      describe.each(TestConfig[Network.ArbitrumOne])(
        'Acceptance',
        ({ address, Harness }) => {
          let harness: PoolTestHarness<BaseLiquidityPool<unknown>>;
          const lpEntryMatrix: number[][] = [
            [0, 0.1],
            [0, 0.01],
            [0, 0.001],
            [1, 0.1],
            [1, 0.01],
            [1, 0.001],
            [2, 0.1],
            [2, 0.01],
            [2, 0.001],
          ];
          const lpExitMatrix: number[][] = [
            // [0, 0.99],
            // [0, 0.5],
            [0, 0.01],
            [1, 0.99],
            [1, 0.5],
            [1, 0.1],
            [2, 0.99],
            [2, 0.5],
            [2, 0.1],
          ];
          const tokenMatrix: number[][] = [
            [0, 1, 0.1],
            [0, 1, 0.01],
            [0, 1, 0.001],
            [0, 2, 0.1],
            [0, 2, 0.01],
            [0, 2, 0.001],
            [1, 0, 0.1],
            [1, 0, 0.01],
            [1, 0, 0.001],
            [1, 2, 0.1],
            [1, 2, 0.01],
            [1, 2, 0.001],
            [2, 0, 0.1],
            [2, 0, 0.01],
            [2, 0, 0.001],
            [2, 1, 0.1],
            [2, 1, 0.01],
            [2, 1, 0.001],
          ];

          beforeAll((done) => {
            Registry.onNetworkReady(Network.ArbitrumOne, () => {
              Registry.getExchangeRegistry().onSubjectKeyReady(
                Network.ArbitrumOne,
                address,
                () => {
                  harness = new Harness(Network.ArbitrumOne, address, provider);
                  done();
                }
              );
            });
          });

          it.each(lpEntryMatrix)(
            `[LP Entry] for ${address} where token in=%i, size=%f`,
            async (tokenIn, utilization) => {
              if (tokenIn >= harness.poolInstance.balances.length) return;
              try {
                const tokensIn = harness.poolInstance.balances[
                  tokenIn
                ].mulInRatePrecision(utilization * RATE_PRECISION);

                const actual = await harness.singleSideEntry(
                  signer,
                  tokenIn,
                  tokensIn
                );
                const inputs = harness.poolInstance.zeroTokenArray();
                inputs[tokenIn] = tokensIn;
                const { lpTokens } =
                  harness.poolInstance.getLPTokensGivenTokens(inputs);

                expect(lpTokens).toBeApprox(actual.lpTokens);

                // Check that the inverse calculation works
                const { tokensIn: calculatedTokensIn } =
                  harness.poolInstance.getTokensRequiredForLPTokens(
                    lpTokens,
                    tokenIn
                  );

                calculatedTokensIn.forEach((c, i) => {
                  expect(c).toBeApprox(inputs[i]);
                });
              } catch (e) {
                if ((e as Error).name === 'UnimplementedPoolMethod') return;
                throw e;
              }
            }
          );

          it.each([0.5, 0.01])(
            `[LP Balanced Exit] for ${address} where token out=%i, balanceShare=%f`,
            async (balanceShare) => {
              try {
                const totalBalance = await harness.balanceOf(signer);
                const balanceOut = totalBalance.mulInRatePrecision(
                  balanceShare * RATE_PRECISION
                );

                const actual = await harness.multiTokenExit(signer, balanceOut);

                const { tokensOut } =
                  harness.poolInstance.getTokensOutGivenLPTokens(balanceOut);

                tokensOut.forEach((c, i) => {
                  expect(c).toBeApprox(actual.tokensOut[i]);
                });
              } catch (e) {
                if ((e as Error).name === 'UnimplementedPoolMethod') return;
                throw e;
              }
            }
          );

          it.each(lpExitMatrix)(
            `[LP Exit] for ${address} where token out=%i, balanceShare=%f`,
            async (tokenOut, balanceShare) => {
              if (tokenOut >= harness.poolInstance.balances.length) return;

              try {
                const totalBalance = await harness.balanceOf(signer);
                const balanceOut = totalBalance.mulInRatePrecision(
                  balanceShare * RATE_PRECISION
                );

                const actual = await harness.singleSideExit(
                  signer,
                  tokenOut,
                  balanceOut
                );

                const { tokensOut } =
                  harness.poolInstance.getTokensOutGivenLPTokens(
                    balanceOut,
                    tokenOut
                  );

                expect(tokensOut[tokenOut]).toBeApprox(actual.tokensOut);
              } catch (e) {
                if ((e as Error).name === 'UnimplementedPoolMethod') return;
                throw e;
              }
            }
          );

          it.each(tokenMatrix)(
            `[Trade] for ${address} where token in=%i, token out=%i, size=%f`,
            async (tokenIn, tokenOut, utilization) => {
              if (tokenIn >= harness.poolInstance.balances.length) return;
              if (tokenOut >= harness.poolInstance.balances.length) return;

              try {
                const tokensIn = harness.poolInstance.balances[
                  tokenIn
                ].mulInRatePrecision(utilization * RATE_PRECISION);

                const actual = await harness.trade(
                  signer,
                  tokensIn,
                  tokenIn,
                  tokenOut
                );
                const { tokensOut, feesPaid: _feesPaid } =
                  harness.poolInstance.calculateTokenTrade(
                    tokensIn,
                    tokenIn,
                    tokenOut
                  );
                // console.log(
                //   'actual',
                //   tokensIn.toDisplayStringWithSymbol(8),
                //   actual.tokensOut.toDisplayStringWithSymbol(8)
                // );
                // console.log(
                //   'calculated',
                //   tokensOut.toDisplayStringWithSymbol(8)
                // );
                // const oracles = Registry.getOracleRegistry();
                // console.log(
                //   'interest rate actual',
                //   oracles.exchangeToInterestRate(
                //     tokensIn.n.mul(RATE_PRECISION).div(actual.tokensOut.n),
                //     actual.tokensOut.token.maturity!
                //   ) / -RATE_PRECISION
                // );
                // console.log(
                //   'interest rate calculated',
                //   oracles.exchangeToInterestRate(
                //     tokensIn.n.mul(RATE_PRECISION).div(tokensOut.n),
                //     actual.tokensOut.token.maturity!
                //   ) / -RATE_PRECISION
                // );
                expect(tokensOut).toBeApprox(actual.tokensOut);
              } catch (e) {
                if ((e as Error).name === 'UnimplementedPoolMethod') return;
                throw e;
              }
            }
          );

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
