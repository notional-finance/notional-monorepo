import { Network } from '@notional-finance/util';
import { PoolDefinition } from '..';

const registerTokensMap = {
  mainnet: {
    'sNOTE-BPT': '0x5122E01D819E58BB2E22528c0D68D310f0AA6FD7' as const,
    PayPool: '0x383E6b4437b59fff47B619CBA855CA29342A8559' as const,
    PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8' as const,
    'crvUSDUSDC-f': '0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E' as const,
    crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' as const,
    'crvUSDUSDT-f': '0x390f3595bCa2Df7d23783dFd126427CCeb997BF4' as const,
    'GHO/USDT/USDC': '0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF' as const,
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f' as const,
    'weETH/rETH': '0x05ff47AFADa98a98982113758878F9A8B9FddA0a' as const,
    weETH: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee' as const,
    'ezETH-WETH-BPT': '0x596192bB6e41802428Ac943D2f1476C1Af25CC0E' as const,
    ezETH: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110' as const,
    USDeUSDC: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72' as const,
    USDe: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' as const,
    GHOcrvUSD: '0x635EF0056A597D13863B73825CcA297236578595' as const,
    GHOUSDe: '0x670a72e6D22b0956C0D2573288F82DCc5d6E3a61' as const,
    'rsETH/WETH': '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D' as const,
    rsETH: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7' as const,
    '2BTC-f': '0xB7ECB2AA52AA64a717180E030241bC75Cd946726' as const,
    tBTC: '0x18084fbA666a33d37592fA2633fD49a74DD93a88' as const,
    CVX: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b' as const,
    CRV: '0xd533a949740bb3306d119cc777fa900ba034cd52' as const,
  },
  arbitrum: {
    'FRAXBP-f': '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5' as const,
    'Curve.fi USDC/USDT': '0x7f90122BF0700F9E7e1F688fe926940E8839F353' as const,
    'USDC.e': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' as const,
    'crvUSD/USDT': '0x73aF1150F265419Ef8a5DB41908B700C32D49135' as const,
    'crvUSD/USDC': '0xec090cf6DD891D2d014beA6edAda6e05E025D93d' as const,
    crvUSD: '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5' as const,
    'B-wstETH-WETH-Stable':
      '0x9791d590788598535278552EEcD4b211bFc790CB' as const,
    'rETH-WETH-BPT': '0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81' as const,
    'wstETH/rETH/cbETH': '0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B' as const,
    'cbETH/rETH/wstETH': '0x2d6CeD12420a9AF5a83765a8c48Be2aFcD1A8FEb' as const,
    '4POOL-BPT': '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5' as const,
    'ezETH/wstETH': '0xB61371Ab661B1ACec81C699854D2f911070C059E' as const,
    ezETH: '0x2416092f143378750bb29b79eD961ab195CcEea5' as const,
    'rsETH/wETH': '0x90e6CB5249f5e1572afBF8A96D8A1ca6aCFFd739' as const,
    rsETH: '0x4186BFC76E2E237523CBC30FD220FE055156b41F' as const,
    '2BTC-f': '0x755D6688AD74661Add2FB29212ef9153D40fcA46' as const,
    tBTC: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40' as const,
    'rETH/wETH BPT': '0xd0EC47c54cA5e20aaAe4616c25C825c7f48D4069' as const,
    '2BTC-ng': '0x186cF879186986A20aADFb7eAD50e3C20cb26CeC' as const,
    'Pendle-Market-rsETH-26SEP2024':
      '0xED99fC8bdB8E9e7B8240f62f69609a125A0Fbf14' as const,
    'PT-rsETH-26SEP2024': '0x30c98c0139B62290E26aC2a2158AC341Dcaf1333' as const,
    'Pendle-Market-rsETH-26DEC2024':
      '0xcB471665BF23B2Ac6196D84D947490fd5571215f' as const,
    'PT-rsETH-26DEC2024': '0x355ec27c9d4530dE01A103FA27F884a2F3dA65ef' as const,
    'SY-rsETH': '0xf176fb51f4eb826136a54fdc71c50fcd2202e272' as const,
  },
};

// NOTE: all the addresses in this file are checksummed
const defaultPools: Record<Network, PoolDefinition[]> = {
  [Network.mainnet]: [
    {
      // nETH
      address: '0x3410463726a7A22ce0809367a4418FE82Fc31FD3',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nDAI
      address: '0x87C478f00999d65F88D3088291a6928b55703444',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nUSDC
      address: '0x2920F9Fc667E780C0CB5a78a104d21413377f97E',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nwstETH
      address: '0x9499ad68Cd1b00a869853a986ac3F82401650933',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nFRAX
      address: '0x96bE0C426Ea53ECb6F154bEd27c9dE85722A5C6F',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nrETH
      address: '0xd623646DA89F9264547272f268785d9C64af9ce3',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nUSDT
      address: '0x0Da210F60A179Ee3364123943930dAdbAb8B210e',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // ncbETH
      address: '0xa2ADBc0d7C8Da646f9d5f6CfA9Eb396403067da0',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nGHO
      address: '0x2F7350Cb5e434C2d177922110c7e314953B84Afc',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
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
      address: registerTokensMap[Network.mainnet].PayPool,
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet].PayPool,
          address: registerTokensMap[Network.mainnet].PayPool,
          network: Network.mainnet,
          symbol: 'PayPool',
          name: 'PYUSDUSDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].PYUSD,
          address: registerTokensMap[Network.mainnet].PYUSD,
          network: Network.mainnet,
          symbol: 'PYUSD',
          name: 'PayPal USD',
          decimals: 6,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['crvUSDUSDC-f'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['crvUSDUSDC-f'],
          address: registerTokensMap[Network.mainnet]['crvUSDUSDC-f'],
          network: Network.mainnet,
          symbol: 'crvUSDUSDC-f',
          name: 'Curve.fi Factory Plain Pool: crvUSD/USDT ',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].crvUSD,
          address: registerTokensMap[Network.mainnet].crvUSD,
          network: Network.mainnet,
          symbol: 'crvUSD',
          name: 'Curve.Fi USD Stablecoin',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['crvUSDUSDT-f'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['crvUSDUSDT-f'],
          address: registerTokensMap[Network.mainnet]['crvUSDUSDT-f'],
          network: Network.mainnet,
          symbol: 'crvUSDUSDT-f',
          name: 'Curve.fi Factory Plain Pool: crvUSD/USDT ',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].crvUSD,
          address: registerTokensMap[Network.mainnet].crvUSD,
          network: Network.mainnet,
          symbol: 'crvUSD',
          name: 'Curve.Fi USD Stablecoin',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['GHO/USDT/USDC'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['GHO/USDT/USDC'],
          address: registerTokensMap[Network.mainnet]['GHO/USDT/USDC'],
          network: Network.mainnet,
          symbol: 'GHO/USDT/USDC',
          name: 'Balancer GHO/USDT/USDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].GHO,
          address: registerTokensMap[Network.mainnet].GHO,
          network: Network.mainnet,
          symbol: 'GHO',
          name: 'Gho Token',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['weETH/rETH'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['weETH/rETH'],
          address: registerTokensMap[Network.mainnet]['weETH/rETH'],
          network: Network.mainnet,
          symbol: 'weETH/rETH',
          name: 'Balancer weETH/rETH StablePool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].weETH,
          address: registerTokensMap[Network.mainnet].weETH,
          network: Network.mainnet,
          symbol: 'weETH',
          name: 'Wrapped eETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['ezETH-WETH-BPT'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['ezETH-WETH-BPT'],
          address: registerTokensMap[Network.mainnet]['ezETH-WETH-BPT'],
          network: Network.mainnet,
          symbol: 'ezETH-WETH-BPT',
          name: 'Balancer ezETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].ezETH,
          address: registerTokensMap[Network.mainnet].ezETH,
          network: Network.mainnet,
          symbol: 'ezETH',
          name: 'Renzo Staked ETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet].USDeUSDC,
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet].USDeUSDC,
          address: registerTokensMap[Network.mainnet].USDeUSDC,
          network: Network.mainnet,
          symbol: 'USDeUSDC',
          name: 'USDe-USDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].USDe,
          address: registerTokensMap[Network.mainnet].USDe,
          network: Network.mainnet,
          symbol: 'USDe',
          name: 'USDe',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet].GHOcrvUSD,
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet].GHOcrvUSD,
          address: registerTokensMap[Network.mainnet].GHOcrvUSD,
          network: Network.mainnet,
          symbol: 'GHOcrvUSD',
          name: 'GHO/crvUSD',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].crvUSD,
          address: registerTokensMap[Network.mainnet].crvUSD,
          network: Network.mainnet,
          symbol: 'crvUSD',
          name: 'Curve.Fi USD Stablecoin',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet].GHOUSDe,
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet].GHOUSDe,
          address: registerTokensMap[Network.mainnet].GHOUSDe,
          network: Network.mainnet,
          symbol: 'GHOUSDe',
          name: 'GHOTHENA',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].USDe,
          address: registerTokensMap[Network.mainnet].USDe,
          network: Network.mainnet,
          symbol: 'USDe',
          name: 'USDe',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['rsETH/WETH'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['rsETH/WETH'],
          address: registerTokensMap[Network.mainnet]['rsETH/WETH'],
          network: Network.mainnet,
          symbol: 'rsETH/WETH',
          name: 'Balancer rsETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].rsETH,
          address: registerTokensMap[Network.mainnet].rsETH,
          network: Network.mainnet,
          symbol: 'rsETH',
          name: 'rsETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.mainnet]['2BTC-f'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet]['2BTC-f'],
          address: registerTokensMap[Network.mainnet]['2BTC-f'],
          network: Network.mainnet,
          symbol: '2BTC-f',
          name: 'Curve.fi Factory Plain Pool: tBTC/WBTC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].tBTC,
          address: registerTokensMap[Network.mainnet].tBTC,
          network: Network.mainnet,
          symbol: 'tBTC',
          name: 'tBTC v2',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        // Register whitelisted rewards
        {
          id: registerTokensMap[Network.mainnet].CVX,
          address: registerTokensMap[Network.mainnet].CVX,
          network: Network.mainnet,
          symbol: 'CVX',
          name: 'Convex Token',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet].CRV,
          address: registerTokensMap[Network.mainnet].CRV,
          network: Network.mainnet,
          symbol: 'CRV',
          name: 'Curve DAO Token',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.arbitrum]: [
    {
      // nwstETH
      address: '0x06D45ef1f8b3C37b0de66f156B11F10b4837619A',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nUSDC
      address: '0x0F13fb925eDC3E1FE947209010d9c0E072986ADc',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nETH
      address: '0x18b0Fc5A233acF1586Da7C199Ca9E3f486305A29',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nDAI
      address: '0x2C42940A06A3F78b3cB7fc62b5fc7DE404c9216f',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // 'nWBTC'
      address: '0x52602A1075645845a303f86B2BD0b7E7227f99d6',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nFRAX
      address: '0x69633657aCfb930d5A97a2662Dd32ef1aC8a2f57',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      // nRETH
      address: '0x6F6603F12af215bDba1f55f643e098530DD45B8F',
      PoolClass: 'fCashMarket',
      registerTokens: [],
      earliestBlock: 123855493,
    },
    {
      // nUSDT
      address: '0x9c0Fbb8caDE7B178b135fD2F1da125a37B27f442',
      PoolClass: 'fCashMarket',
      registerTokens: [],
      earliestBlock: 123865068,
    },
    {
      // ncbETH
      address: '0x809B43d2A81A34c4D91BF4815A544d839d0773Bb',
      PoolClass: 'fCashMarket',
      registerTokens: [],
      earliestBlock: 145559028,
    },
    {
      address: registerTokensMap[Network.arbitrum]['FRAXBP-f'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['FRAXBP-f'],
          address: registerTokensMap[Network.arbitrum]['FRAXBP-f'],
          network: Network.arbitrum,
          symbol: 'FRAXBP-f',
          name: 'Curve.fi Factory Plain Pool: FRAXBP',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['Curve.fi USDC/USDT'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['Curve.fi USDC/USDT'],
          address: registerTokensMap[Network.arbitrum]['Curve.fi USDC/USDT'],
          network: Network.arbitrum,
          symbol: '2CRV',
          name: 'Curve.fi USDC/USDT',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum]['USDC.e'],
          address: registerTokensMap[Network.arbitrum]['USDC.e'],
          network: Network.arbitrum,
          symbol: 'USDC.e',
          name: 'USD Coin (Arb1)',
          decimals: 6,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['crvUSD/USDT'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['crvUSD/USDT'],
          address: registerTokensMap[Network.arbitrum]['crvUSD/USDT'],
          network: Network.arbitrum,
          symbol: 'crvUSDC',
          name: 'crvUSD/USDT',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum].crvUSD,
          address: registerTokensMap[Network.arbitrum].crvUSD,
          network: Network.arbitrum,
          symbol: 'crvUSD',
          name: 'Curve.Fi USD Stablecoin',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['crvUSD/USDC'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['crvUSD/USDC'],
          address: registerTokensMap[Network.arbitrum]['crvUSD/USDC'],
          network: Network.arbitrum,
          symbol: 'crvUSDC',
          name: 'crvUSD/USDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum].crvUSD,
          address: registerTokensMap[Network.arbitrum].crvUSD,
          network: Network.arbitrum,
          symbol: 'crvUSD',
          name: 'Curve.Fi USD Stablecoin',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['B-wstETH-WETH-Stable'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['B-wstETH-WETH-Stable'],
          address: registerTokensMap[Network.arbitrum]['B-wstETH-WETH-Stable'],
          network: Network.arbitrum,
          symbol: 'B-wstETH-WETH-Stable',
          name: 'Balancer wstETH-WETH-Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['rETH-WETH-BPT'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['rETH-WETH-BPT'],
          address: registerTokensMap[Network.arbitrum]['rETH-WETH-BPT'],
          network: Network.arbitrum,
          symbol: 'rETH-WETH-BPT',
          name: 'Balancer rETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['wstETH/rETH/cbETH'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['wstETH/rETH/cbETH'],
          address: registerTokensMap[Network.arbitrum]['wstETH/rETH/cbETH'],
          network: Network.arbitrum,
          symbol: 'wstETH/rETH/cbETH',
          name: 'Balancer wstETH/rETH/cbETH CSP',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['cbETH/rETH/wstETH'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['cbETH/rETH/wstETH'],
          address: registerTokensMap[Network.arbitrum]['cbETH/rETH/wstETH'],
          network: Network.arbitrum,
          symbol: 'cbETH/rETH/wstETH',
          name: 'Balancer cbETH/rETH/wstETH CSP',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['4POOL-BPT'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['4POOL-BPT'],
          address: registerTokensMap[Network.arbitrum]['4POOL-BPT'],
          network: Network.arbitrum,
          symbol: '4POOL-BPT',
          name: 'Balancer Stable 4pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum]['USDC.e'],
          address: registerTokensMap[Network.arbitrum]['USDC.e'],
          network: Network.arbitrum,
          symbol: 'USDC.e',
          name: 'USD Coin (Arb1)',
          decimals: 6,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['ezETH/wstETH'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['ezETH/wstETH'],
          address: registerTokensMap[Network.arbitrum]['ezETH/wstETH'],
          network: Network.arbitrum,
          symbol: 'ezETH/wstETH',
          name: 'Balancer ezETH/wstETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum].ezETH,
          address: registerTokensMap[Network.arbitrum].ezETH,
          network: Network.arbitrum,
          symbol: 'ezETH',
          name: 'Renzo Restaked ETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['rsETH/wETH'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['rsETH/wETH'],
          address: registerTokensMap[Network.arbitrum]['rsETH/wETH'],
          network: Network.arbitrum,
          symbol: 'rsETH/wETH',
          name: 'Balancer rsETH/wETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum].rsETH,
          address: registerTokensMap[Network.arbitrum].rsETH,
          network: Network.arbitrum,
          symbol: 'rsETH',
          name: 'KelpDao Restaked ETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['2BTC-f'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['2BTC-f'],
          address: registerTokensMap[Network.arbitrum]['2BTC-f'],
          network: Network.arbitrum,
          symbol: '2BTC-f',
          name: 'Curve.fi Factory Plain Pool: 2BTC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum].tBTC,
          address: registerTokensMap[Network.arbitrum].tBTC,
          network: Network.arbitrum,
          symbol: 'tBTC',
          name: 'Arbitrum tBTC v2',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['rETH/wETH BPT'],
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['rETH/wETH BPT'],
          address: registerTokensMap[Network.arbitrum]['rETH/wETH BPT'],
          network: Network.arbitrum,
          symbol: 'rETH/wETH BPT',
          name: 'Balancer rETH/wETH StablePool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: registerTokensMap[Network.arbitrum]['2BTC-ng'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum]['2BTC-ng'],
          address: registerTokensMap[Network.arbitrum]['2BTC-ng'],
          network: Network.arbitrum,
          symbol: '2BTC-ng',
          name: '2BTC-ng',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.arbitrum]['Pendle-Market-rsETH-26SEP2024'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum][
            'Pendle-Market-rsETH-26SEP2024'
          ],
          address:
            registerTokensMap[Network.arbitrum][
              'Pendle-Market-rsETH-26SEP2024'
            ],
          name: 'Pendle Market: rsETH 26SEP2024',
          network: Network.arbitrum,
          symbol: 'PENDLE-LPT rsETH 26SEP2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum]['PT-rsETH-26SEP2024'],
          address: registerTokensMap[Network.arbitrum]['PT-rsETH-26SEP2024'],
          name: 'PT: rsETH 26SEP2024',
          network: Network.arbitrum,
          symbol: 'PT-rsETH-26SEP2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum]['SY-rsETH'],
          address: registerTokensMap[Network.arbitrum]['SY-rsETH'],
          name: 'SY rsETH',
          network: Network.arbitrum,
          symbol: 'SY-rsETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.arbitrum]['Pendle-Market-rsETH-26DEC2024'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.arbitrum][
            'Pendle-Market-rsETH-26DEC2024'
          ],
          address:
            registerTokensMap[Network.arbitrum][
              'Pendle-Market-rsETH-26DEC2024'
            ],
          name: 'Pendle Market: rsETH 26DEC2024',
          network: Network.arbitrum,
          symbol: 'PENDLE-LPT rsETH 26DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum]['PT-rsETH-26DEC2024'],
          address: registerTokensMap[Network.arbitrum]['PT-rsETH-26DEC2024'],
          name: 'PT: rsETH 26DEC2024',
          network: Network.arbitrum,
          symbol: 'PT-rsETH-26DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.arbitrum]['SY-rsETH'],
          address: registerTokensMap[Network.arbitrum]['SY-rsETH'],
          name: 'SY rsETH',
          network: Network.arbitrum,
          symbol: 'SY-rsETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.all]: [],
};

export type RegisterToken =
  | (typeof registerTokensMap)[Network.mainnet][keyof typeof registerTokensMap.mainnet]
  | (typeof registerTokensMap)[Network.arbitrum][keyof typeof registerTokensMap.arbitrum];

export default defaultPools;
