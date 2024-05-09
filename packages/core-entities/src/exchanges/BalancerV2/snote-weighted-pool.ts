import { BalancerPoolABI } from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import { Contract, BigNumber } from 'ethers';
import { getCommonBalancerAggregateCall } from './common-calls';
import FixedPoint from './fixed-point';
import WeightedPool from './weighted-pool';
import { Network } from '@notional-finance/util';

export default class SNOTEWeightedPool extends WeightedPool {
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, BalancerPoolABI);
    const commonCalls = getCommonBalancerAggregateCall(
      network,
      poolAddress,
      pool
    );

    return commonCalls.concat(
      {
        stage: 0,
        target: pool,
        method: 'getNormalizedWeights',
        key: 'normalizedWeights',
        transform: (r: BigNumber[]) => r.map(FixedPoint.from),
      },
      {
        stage: 0,
        target: pool,
        method: 'getScalingFactors',
        key: 'scalingFactors',
        transform: (r: BigNumber[]) => r.map(FixedPoint.from),
      },
      {
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'lastPostJoinExitInvariant',
        transform: () => undefined,
      }
    );
  }
}
