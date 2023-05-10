import { Network } from '@notional-finance/util';
import { NotionalV3Harness } from './NotionalV3Harness';
import { PoolTestHarness } from './PoolTestHarness';
import { ethers } from 'ethers';

export { PoolTestHarness } from './PoolTestHarness';
export { NotionalV3Harness } from './NotionalV3Harness';
// export { BalancerPoolHarness } from './BalancerPoolHarness';

export const TestConfig: Record<
  Network,
  { address: string; Harness: PoolHarnessConstructor }[]
> = {
  [Network.All]: [],
  [Network.Mainnet]: [],
  [Network.ArbitrumOne]: [
    {
      // nUSDC
      address: '0x0F13fb925eDC3E1FE947209010d9c0E072986ADc',
      Harness: NotionalV3Harness,
    },
  ],
};

export type PoolHarnessConstructor = new (
  network: Network,
  poolAddress: string,
  provider: ethers.providers.JsonRpcProvider
) => PoolTestHarness<any>;
