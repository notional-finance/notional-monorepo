import { Network } from '@notional-finance/util';
import { NotionalV3Harness } from './NotionalV3Harness';
import { BalancerV2Harness } from './BalancerV2Harness';
import { CurveV1Harness } from './CurveV1Harness';
import { CurveV2Harness } from './CurveV2Harness';
import { PoolTestHarness } from './PoolTestHarness';
import { ethers } from 'ethers';
import {
  Curve2TokenPoolV1,
  Curve2TokenPoolV1_SelfLPTokenNoAdmin,
} from 'packages/core-entities/src/exchanges/Curve/Curve2TokenPoolV1';

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
    {
      // Curve.fi Factory Crypto Pool: cbETH/ETH
      address: '0x5b6C539b224014A09B3388e51CaAA8e354c959C8',
      Harness: CurveV2Harness,
    },
  ],
  [Network.ArbitrumOne]: [
    {
      // nUSDC
      address: '0x0F13fb925eDC3E1FE947209010d9c0E072986ADc',
      Harness: NotionalV3Harness,
    },
    {
      address: '0x6eB2dc694eB516B16Dc9FBc678C60052BbdD7d80',
      Harness: CurveV1Harness<Curve2TokenPoolV1>,
    },
    {
      address: '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5',
      Harness: CurveV1Harness<Curve2TokenPoolV1_SelfLPTokenNoAdmin>,
    },
  ],
};

export type PoolHarnessConstructor = new (
  network: Network,
  poolAddress: string,
  provider: ethers.providers.JsonRpcProvider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => PoolTestHarness<any>;
