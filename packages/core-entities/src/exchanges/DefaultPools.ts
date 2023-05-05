import { Network, PoolDefinition } from '../Definitions';

const defaultPools: Record<Network, PoolDefinition[]> = {
  [Network.Mainnet]: [
    {
      address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      PoolClass: 'MetaStablePool',
    },
  ],
  [Network.ArbitrumOne]: [],
  [Network.All]: [],
};

export default defaultPools;

// TODO: maybe token registry server can pull this information somehow
// lpToken: {
//   address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
//   network: Network.Mainnet,
//   symbol: 'B-stETH-STABLE',
//   decimalPlaces: 18,
//   tokenInterface: 'ERC20',
// },
