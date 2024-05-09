import {
  BalancerPoolABI,
  BalancerVault,
  BalancerVaultABI,
} from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import { Contract, BigNumber } from 'ethers';
import FixedPoint from './fixed-point';
import WeightedPool from './weighted-pool';
import { Network } from '@notional-finance/util';
import { TokenBalance } from '../../token-balance';

export default class SNOTEWeightedPool extends WeightedPool {
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, BalancerPoolABI);

    return [
      {
        stage: 0,
        target: pool,
        method: 'getSwapFeePercentage',
        key: 'swapFeePercentage',
        args: [],
        transform: (r: BigNumber) => FixedPoint.from(r),
      },
      {
        stage: 0,
        target: pool,
        method: 'totalSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber) => {
          return TokenBalance.toJSON(r, poolAddress, network);
        },
      },
      {
        stage: 0,
        target: pool,
        method: 'getPoolId',
        key: 'poolId',
      },
      {
        stage: 0,
        target: pool,
        method: 'getVault',
        key: 'vaultAddress',
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(
            r[`${poolAddress}.vaultAddress`] as string,
            BalancerVaultABI
          ),
        method: 'getPoolTokens',
        args: (r) => [r[`${poolAddress}.poolId`]],
        key: 'balances',
        transform: (
          r: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>
        ) =>
          r.balances.map((b, i) =>
            TokenBalance.toJSON(b, r.tokens[i], network)
          ),
      },
      {
        stage: 0,
        target: pool,
        method: 'getNormalizedWeights',
        key: 'normalizedWeights',
        transform: (r: BigNumber[]) => r.map(FixedPoint.from),
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'scalingFactors',
        transform: () => [
          BigNumber.from(10).pow(18),
          BigNumber.from(10).pow(10),
        ],
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'lastPostJoinExitInvariant',
        transform: () => undefined,
      },
    ];
  }
}
