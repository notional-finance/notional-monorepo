import { Network } from '@notional-finance/util';
import { PoolDefinition } from '../Definitions';

const defaultPools: Record<Network, PoolDefinition[]> = {
  [Network.Mainnet]: [
    {
      address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      PoolClass: 'MetaStablePool',
      registerTokens: [
        {
          id: '0x32296969ef14eb0c6d29669c550d4a0449130230',
          address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
          network: Network.Mainnet,
          symbol: 'B-stETH-STABLE',
          name: 'Balancer stETH-ETH Stable',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.ArbitrumOne]: [],
  [Network.All]: [],
};

export default defaultPools;
