import { Network, PoolDefinition, TokenInterface } from '../Definitions';
import { MetaStable2Token } from '.';

const mainnetPools = [
  {
    address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
    poolClass: MetaStable2Token,
    lpToken: {
      address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      network: Network.Mainnet,
      symbol: 'B-stETH-STABLE',
      decimalPlaces: 18,
      tokenInterface: TokenInterface.ERC20,
    },
  },
];

const defaultPools = [[Network.Mainnet, mainnetPools]] as [
  Network,
  PoolDefinition[]
][];

export default defaultPools;
