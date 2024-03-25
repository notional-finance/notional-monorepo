import { Network } from '@notional-finance/util';
import { NotionalV3Harness } from './NotionalV3Harness';
import { BalancerV2Harness } from './BalancerV2Harness';
import { CurveV1Harness } from './CurveV1Harness';
import { CurveV2Harness } from './CurveV2Harness';
import { PoolTestHarness } from './PoolTestHarness';
import { ethers } from 'ethers';
import { Curve2TokenPoolV1_SelfLPTokenNoAdmin } from '../../../src/exchanges/index';

export { PoolTestHarness } from './PoolTestHarness';

export const TestConfig: Record<
  Network,
  { address: string; Harness: PoolHarnessConstructor }[]
> = {
  [Network.all]: [],
  [Network.mainnet]: [
    {
      // Curve.fi Factory Crypto Pool: cbETH/ETH
      address: '0x5b6C539b224014A09B3388e51CaAA8e354c959C8',
      Harness: CurveV2Harness,
    },
  ],
  [Network.arbitrum]: [
    {
      // wstETH/WETH Balancer Composable Pool
      address: '0x9791d590788598535278552EEcD4b211bFc790CB',
      Harness: BalancerV2Harness,
    },
    {
      // 4POOL Balancer Composable Pool
      address: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
      Harness: BalancerV2Harness,
    },
    {
      // RDNT/WETH Composable Pool
      address: '0x32dF62dc3aEd2cD6224193052Ce665DC18165841',
      Harness: BalancerV2Harness,
    },
    {
      // nUSDC
      address: '0x0F13fb925eDC3E1FE947209010d9c0E072986ADc',
      Harness: NotionalV3Harness,
    },
    // {
    //   address: '0x6eB2dc694eB516B16Dc9FBc678C60052BbdD7d80',
    //   Harness: CurveV1Harness<Curve2TokenPoolV1>,
    // },
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
