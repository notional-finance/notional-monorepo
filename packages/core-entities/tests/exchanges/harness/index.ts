import { Network } from '@notional-finance/util';
import { NotionalV3Harness } from './NotionalV3Harness';
import { BalancerV2Harness } from './BalancerV2Harness';
import { CurveV1Harness } from './CurveV1Harness';
import { PoolTestHarness } from './PoolTestHarness';
import { ethers } from 'ethers';

export { PoolTestHarness } from './PoolTestHarness';

export const TestConfig: Record<
  Network,
  { address: string; Harness: PoolHarnessConstructor }[]
> = {
  [Network.All]: [],
  [Network.Mainnet]: [
    {
      // stETH/ETH Balancer MetaStablePool
      address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      Harness: BalancerV2Harness,
    },
  ],
  [Network.ArbitrumOne]: [
    /* {
      // nUSDC
      address: '0x0F13fb925eDC3E1FE947209010d9c0E072986ADc',
      Harness: NotionalV3Harness,
    }, */
    {
      address: '0x6eB2dc694eB516B16Dc9FBc678C60052BbdD7d80',
      Harness: CurveV1Harness,
    },
  ],
};

export type PoolHarnessConstructor = new (
  network: Network,
  poolAddress: string,
  provider: ethers.providers.JsonRpcProvider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => PoolTestHarness<any>;
