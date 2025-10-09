import { Network } from '@notional-finance/util';
import { PoolDefinition } from '..';

export const registerTokensMap = {
  mainnet: {
    'sNOTE-BPT': '0x5122E01D819E58BB2E22528c0D68D310f0AA6FD7' as const,
    PayPool: '0x383E6b4437b59fff47B619CBA855CA29342A8559' as const,
    PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8' as const,
    crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' as const,
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f' as const,
    weETH: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee' as const,
    ezETH: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110' as const,
    USDeUSDC: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72' as const,
    '3Pool': '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7' as const,
    '3PoolLP': '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490' as const,
    USDe: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' as const,
    rsETH: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7' as const,
    tBTC: '0x18084fbA666a33d37592fA2633fD49a74DD93a88' as const,
    CVX: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b' as const,
    CRV: '0xd533a949740bb3306d119cc777fa900ba034cd52' as const,
    'Pendle-Market-sUSDe-27NOV2025':
      '0xb6aC3d5da138918aC4E84441e924a20daA60dBdd' as const,
    'PT-sUSDe-27NOV2025': '0xe6A934089BBEe34F832060CE98848359883749B3' as const,
    'SY-sUSDe': '0xAbf8165dD7a90ab75878161db15Bf85F6F781d9b' as const,
    'sDAI/sUSDe': '0x167478921b907422f8e88b43c4af2b8bea278d3a' as const,
    'OETH/WETH': '0xcc7d5785AD5755B6164e21495E07aDb0Ff11C2A8' as const,
  },
  arbitrum: {},
};

// NOTE: all the addresses in this file are checksummed
const defaultPools: Record<Network, PoolDefinition[]> = {
  [Network.mainnet]: [
    {
      address: registerTokensMap[Network.mainnet]['sNOTE-BPT'],
      PoolClass: 'SNOTEWeightedPool',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['sNOTE-BPT'],
          address: registerTokensMap[Network.mainnet]['sNOTE-BPT'],
          network: Network.mainnet,
          symbol: 'sNOTE-BPT',
          name: 'Staked NOTE Weighted Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['3Pool'],
      PoolClass: 'Curve3Pool',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['3PoolLP'],
          address: registerTokensMap[Network.mainnet]['3PoolLP'],
          network: Network.mainnet,
          symbol: '3Crv',
          name: 'Curve.fi DAI/USDC/USDT',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['sDAI/sUSDe'],
      PoolClass: 'Curve2TokenPoolNG',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['sDAI/sUSDe'],
          address: registerTokensMap[Network.mainnet]['sDAI/sUSDe'],
          network: Network.mainnet,
          symbol: 'MtEthena',
          name: 'sDAI/sUSDe',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['OETH/WETH'],
      PoolClass: 'Curve2TokenPoolNG',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['OETH/WETH'],
          address: registerTokensMap[Network.mainnet]['OETH/WETH'],
          network: Network.mainnet,
          symbol: 'OETH/WETH',
          name: 'OETH/WETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-sUSDe-27NOV2025'],
      PoolClass: 'PendleMarketWithFixedSyToAssetExchangeRate',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-sUSDe-27NOV2025'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-sUSDe-27NOV2025'],
          name: 'Pendle Market: sUSDe 27NOV2025',
          network: Network.mainnet,
          symbol: 'PENDLE-LPT sUSDe 27NOV2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-sUSDe-27NOV2025'],
          address: registerTokensMap[Network.mainnet]['PT-sUSDe-27NOV2025'],
          name: 'PT: sUSDe 27NOV2025',
          network: Network.mainnet,
          symbol: 'PT-sUSDe-27NOV2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['SY-sUSDe'],
          address: registerTokensMap[Network.mainnet]['SY-sUSDe'],
          name: 'SY sUSDe',
          network: Network.mainnet,
          symbol: 'SY-sUSDe',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.arbitrum]: [],
  [Network.all]: [],
};

export type RegisterToken =
  | (typeof registerTokensMap)[Network.mainnet][keyof typeof registerTokensMap.mainnet]
  | (typeof registerTokensMap)[Network.arbitrum][keyof typeof registerTokensMap.arbitrum];

export default defaultPools;
