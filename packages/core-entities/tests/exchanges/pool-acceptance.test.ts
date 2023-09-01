import { Registry, AccountFetchMode } from '../../src';
import { Network, RATE_PRECISION } from '@notional-finance/util';
import { PoolHarnessConstructor, PoolTestHarness, TestConfig } from './harness';
import { BaseLiquidityPool } from '../../src/exchanges';

jest.setTimeout(30000);

const acceptanceSuite = ({
  address,
  Harness,
}: {
  address: string;
  Harness: PoolHarnessConstructor;
}) => {
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
    [0, 0.8],
    [0, 0.5],
    [0, 0.1],
    [0, 0.01],
    [1, 0.8],
    [1, 0.5],
    [1, 0.1],
    [1, 0.01],
    [2, 0.8],
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
    `[LP Single Sided Entry] for ${address} where token in=%i, size=%f`,
    async (tokenIn, utilization) => {
      if (tokenIn >= harness.poolInstance.balances.length) return;

      try {
        const tokensIn = harness.poolInstance.balances[tokenIn]
          .mulInRatePrecision(utilization * RATE_PRECISION)
          .abs();

        const actual = await harness.singleSideEntry(signer, tokenIn, tokensIn);
        const inputs = harness.poolInstance.zeroTokenArray();
        inputs[tokenIn] = tokensIn;
        const expected = harness.poolInstance.getLPTokensGivenTokens(inputs);

        expect(expected.lpTokens).toBeApprox(actual.lpTokens);

        // Check that the inverse calculation works
        const { tokensIn: calculatedTokensIn } =
          harness.poolInstance.getTokensRequiredForLPTokens(
            actual.lpTokens,
            tokenIn
          );

        calculatedTokensIn.forEach((c, i) => {
          expect(c).toBeApprox(inputs[i], 0.001);
        });
      } catch (e) {
        if ((e as Error).name === 'UnimplementedPoolMethod') return;
        throw e;
      }
    }
  );

  it.each([0.5, 0.01])(
    `[LP Balanced Exit] for ${address} where balanceShare=%f`,
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

        // Test inverse calculation here
        const { lpTokens } =
          harness.poolInstance.getLPTokensRequiredForTokens(tokensOut);
        expect(lpTokens).toBeApprox(balanceOut, 0.001);
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

        const { tokensOut } = harness.poolInstance.getTokensOutGivenLPTokens(
          balanceOut,
          tokenOut
        );

        expect(tokensOut[tokenOut]).toBeApprox(actual.tokensOut);

        const { lpTokens } =
          harness.poolInstance.getLPTokensRequiredForTokens(tokensOut);
        expect(lpTokens).toBeApprox(balanceOut, 0.001);
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
        const tokensIn = harness.poolInstance.balances[tokenIn]
          .mulInRatePrecision(utilization * RATE_PRECISION)
          .abs();

        const actual = await harness.trade(signer, tokensIn, tokenIn, tokenOut);
        const { tokensOut, feesPaid: _feesPaid } =
          harness.poolInstance.calculateTokenTrade(tokensIn, tokenOut);
        expect(tokensOut).toBeApprox(actual.tokensOut);
      } catch (e) {
        if ((e as Error).name === 'UnimplementedPoolMethod') return;
        throw e;
      }
    }
  );

  it.todo('calculates balanced entry');
  it.todo('calculates unbalanced entry and exit');

  it.skip('calculates a price risk table', () => {
    console.log(harness.poolAddress);
    console.log(
      harness.poolInstance
        .getPriceExposureTable(1, 0)
        .map(({ lpTokenValue, secondaryTokenPrice, priceLevelIndex }) => {
          return [
            lpTokenValue.toString(),
            secondaryTokenPrice.toString(),
            priceLevelIndex,
          ];
        })
    );
  });
};

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Arbitrum Pool Tests',
  () => {
    describe.each(TestConfig[Network.ArbitrumOne])(
      'Acceptance',
      acceptanceSuite
    );
  }
);

// NOTE: there is no registry data for this yet so it does not work
// describe.withFork(
//   { blockNumber: 16605421, network: Network.Mainnet },
//   'Mainnet Pool Tests',
//   () => {
//     describe.each(TestConfig[Network.Mainnet])('Acceptance', acceptanceSuite);
//   }
// );
