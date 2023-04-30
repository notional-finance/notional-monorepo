import { Network, PoolDefinition, TokenInterface } from '../Definitions';
import { MetaStablePool, Curve2TokenPoolV1, Curve2TokenPoolV2 } from '.';

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
    poolClass: Curve2TokenPoolV1,
    lpToken: {
      address: '0x06325440D014e39736583c165C2963BA99fAf14E',
      network: Network.Mainnet,
      symbol: 'steCRV',
      decimalPlaces: 18,
      tokenInterface: TokenInterface.ERC20,
    },
  },
  {
    address: '0x73069892f6750CCaaAbabaDC54b6b6b36B3A057D',
    poolClass: Curve2TokenPoolV2,
    lpToken: {
      address: '0x548E063CE6F3BaC31457E4f5b4e2345286274257',
      network: Network.Mainnet,
      symbol: 'cbETHfrxET-f',
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
