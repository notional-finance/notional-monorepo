import { Network, PoolDefinition, TokenInterface } from '../Definitions';
import { MetaStablePool, CurvePoolV1 } from '.';

const mainnetPools = [
  {
    address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
    poolClass: MetaStablePool,
    lpToken: {
      address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      network: Network.Mainnet,
      symbol: 'B-stETH-STABLE',
      decimalPlaces: 18,
      tokenInterface: TokenInterface.ERC20,
    },
  },
  {
    address: '0xdc24316b9ae028f1497c275eb9192a3ea0f67022',
    poolClass: CurvePoolV1,
    lpToken: {
      address: '0x06325440D014e39736583c165C2963BA99fAf14E',
      network: Network.Mainnet,
      symbol: 'steCRV',
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
