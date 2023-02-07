import { BigNumber } from 'ethers';
import { MockPool } from './harness/MockPool';

describe('base liquidity pool unit tests', () => {
  const mockPool = new MockPool(
    BigNumber.from(10).pow(18),
    [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18)],
    [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18)],
    BigNumber.from(10).pow(18),
    BigNumber.from(100_000),
    BigNumber.from(100_000),
    BigNumber.from(100_000)
  );

  it('returns pro rata claims on lp tokens', () => {
    const claims = mockPool.getLPTokenClaims(
      BigNumber.from(1_000).mul(mockPool.LP_TOKEN_PRECISION)
    );
    expect(claims[0]).to;
  });

  // it('returns an oracle valuation of a balance array', () => {
  //   expect(true);
  // });
  // it('returns an oracle valuation of a single LP token', () => {});
  // it('returns spot valuations of an array of balances', () => {});
  // it('returns spot valuations of a single lp token', () => {});
});
