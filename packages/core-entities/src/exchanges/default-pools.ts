import { Network } from '@notional-finance/util';
import { PoolDefinition } from '..';

export const registerTokensMap = {
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
    '3Pool': '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7' as const,
    '3PoolLP': '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490' as const,
    USDe: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' as const,
    GHOcrvUSD: '0x635EF0056A597D13863B73825CcA297236578595' as const,
    GHOUSDe: '0x670a72e6D22b0956C0D2573288F82DCc5d6E3a61' as const,
    'rsETH/WETH': '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D' as const,
    rsETH: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7' as const,
    '2BTC-f': '0xB7ECB2AA52AA64a717180E030241bC75Cd946726' as const,
    tBTC: '0x18084fbA666a33d37592fA2633fD49a74DD93a88' as const,
    CVX: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b' as const,
    CRV: '0xd533a949740bb3306d119cc777fa900ba034cd52' as const,
    'Pendle-Market-ezETH-25DEC2024':
      '0xD8F12bCDE578c653014F27379a6114F67F0e445f' as const,
    'PT-ezETH-25DEC2024': '0xf7906F274c174A52d444175729E3fa98f9bde285' as const,
    'SY-ezETH': '0x22E12A50e3ca49FB183074235cB1db84Fe4C716D' as const,
    'Pendle-Market-USDe-25DEC2024':
      '0x8a49f2AC2730ba15AB7EA832EdaC7f6BA22289f8' as const,
    'PT-USDe-25DEC2024': '0xA8778DD6B7f1F61f2CFda5D3cB18be8F99A8dB30' as const,
    'SY-USDe-25DEC2024': '0xd29a7D69cF5f06CCd777e53d6E437032804aBf89' as const,
    'Pendle-Market-USDe-26MAR2025':
      '0xB451A36c8B6b2EAc77AD0737BA732818143A0E25' as const,
    'PT-USDe-26MAR2025': '0x8A47b431A7D947c6a3ED6E42d501803615a97EAa' as const,
    'SY-USDe-26MAR2025': '0x4dB99b79361F98865230f5702de024C69f629fEC' as const,
    'Pendle-Market-sUSDe-28MAY2025':
      '0xB162B764044697cf03617C2EFbcB1f42e31E4766' as const,
    'PT-sUSDe-28MAY2025': '0xb7de5dFCb74d25c2f21841fbd6230355C50d9308' as const,
    'SY-sUSDe': '0xE877B2A8a53763C8B0534a15e87da28f3aC1257e' as const,
    'sDAI/sUSDe': '0x167478921b907422f8e88b43c4af2b8bea278d3a' as const,
    sUSDe: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497' as const,
    'PT-eUSDe-28MAY2025': '0x50D2C7992b802Eef16c04FeADAB310f31866a545' as const,
    'Pendle-Market-eUSDe-28MAY2025':
      '0x85667e484a32d884010cf16427d90049ccf46e97' as const,
    'SY-eUSDe': '0x7ac8ca87959b1d5EDfe2df5325A37c304DCea4D0' as const,
    'Pendle-Market-USDe-30JUL2025':
      '0x9df192d13d61609d1852461c4850595e1f56e714' as const,
    'SY-USDe-30JUL2025': '0xb47cbf6697a6518222c7af4098a43aefe2739c8c' as const,
    'PT-USDe-30JUL2025': '0x917459337caac939d41d7493b3999f571d20d667' as const,
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
      PoolClass: 'Curve2TokenPoolNG',
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
    {
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-ezETH-25DEC2024'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-ezETH-25DEC2024'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-ezETH-25DEC2024'],
          name: 'Pendle Market: ezETH 25DEC2024',
          network: Network.mainnet,
          symbol: 'PENDLE-LPT ezETH 25DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-ezETH-25DEC2024'],
          address: registerTokensMap[Network.mainnet]['PT-ezETH-25DEC2024'],
          name: 'PT: ezETH 25DEC2024',
          network: Network.mainnet,
          symbol: 'PT-ezETH-25DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['SY-ezETH'],
          address: registerTokensMap[Network.mainnet]['SY-ezETH'],
          name: 'SY ezETH',
          network: Network.mainnet,
          symbol: 'SY-ezETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-USDe-25DEC2024'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-USDe-25DEC2024'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-USDe-25DEC2024'],
          name: 'Pendle Market: USDe 25DEC2024',
          network: Network.mainnet,
          symbol: 'PENDLE-LPT USDe 25DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-USDe-25DEC2024'],
          address: registerTokensMap[Network.mainnet]['PT-USDe-25DEC2024'],
          name: 'PT: USDe 25DEC2024',
          network: Network.mainnet,
          symbol: 'PT-USDe-25DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['SY-USDe-25DEC2024'],
          address: registerTokensMap[Network.mainnet]['SY-USDe-25DEC2024'],
          name: 'SY USDe 25DEC2024',
          network: Network.mainnet,
          symbol: 'SY-USDe-25DEC2024',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-USDe-26MAR2025'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-USDe-26MAR2025'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-USDe-26MAR2025'],
          name: 'Pendle Market: USDe 26MAR2025',
          network: Network.mainnet,
          symbol: 'PENDLE-LPT USDe 26MAR2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-USDe-26MAR2025'],
          address: registerTokensMap[Network.mainnet]['PT-USDe-26MAR2025'],
          name: 'PT: USDe 26MAR2025',
          network: Network.mainnet,
          symbol: 'PT-USDe-26MAR2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['SY-USDe-26MAR2025'],
          address: registerTokensMap[Network.mainnet]['SY-USDe-26MAR2025'],
          name: 'SY USDe 26MAR2025',
          network: Network.mainnet,
          symbol: 'SY-USDe-26MAR2025',
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
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-sUSDe-28MAY2025'],
      PoolClass: 'PendleMarketWithFixedSyToAssetExchangeRate',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-sUSDe-28MAY2025'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-sUSDe-28MAY2025'],
          name: 'Pendle Market: sUSDe 28MAY2025',
          network: Network.mainnet,
          symbol: 'PENDLE-LPT sUSDe 28MAY2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-sUSDe-28MAY2025'],
          address: registerTokensMap[Network.mainnet]['PT-sUSDe-28MAY2025'],
          name: 'PT: sUSDe 28MAY2025',
          network: Network.mainnet,
          symbol: 'PT-sUSDe-28MAY2025',
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
    {
      address: registerTokensMap[Network.mainnet]['sDAI/sUSDe'],
      PoolClass: 'Curve2TokenPoolV1_SelfLPToken',
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
        {
          id: registerTokensMap[Network.mainnet]['sUSDe'],
          address: registerTokensMap[Network.mainnet]['sUSDe'],
          network: Network.mainnet,
          symbol: 'sUSDe',
          name: 'Staked USDe',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-USDe-30JUL2025'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-USDe-30JUL2025'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-USDe-30JUL2025'],
          name: 'Pendle Market: USDe 30JUL2025',
          network: Network.mainnet,
          symbol: 'PENDLE-LPT USDe 30JUL2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-USDe-30JUL2025'],
          address: registerTokensMap[Network.mainnet]['PT-USDe-30JUL2025'],
          name: 'PT: USDe 30JUL2025',
          network: Network.mainnet,
          symbol: 'PT-USDe-30JUL2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['SY-USDe-30JUL2025'],
          address: registerTokensMap[Network.mainnet]['SY-USDe-30JUL2025'],
          name: 'SY USDe 30JUL2025',
          network: Network.mainnet,
          symbol: 'SY-USDe-30JUL2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address:
        registerTokensMap[Network.mainnet]['Pendle-Market-eUSDe-28MAY2025'],
      PoolClass: 'PendleMarket',
      registerTokens: [
        {
          id: registerTokensMap[Network.mainnet][
            'Pendle-Market-eUSDe-28MAY2025'
          ],
          address:
            registerTokensMap[Network.mainnet]['Pendle-Market-eUSDe-28MAY2025'],
          network: Network.mainnet,
          symbol: 'PENDLE-LPT eUSDe 28MAY2025',
          name: 'Pendle Market: eUSDe 28MAY2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['PT-eUSDe-28MAY2025'],
          address: registerTokensMap[Network.mainnet]['PT-eUSDe-28MAY2025'],
          network: Network.mainnet,
          symbol: 'PT-eUSDe-28MAY2025',
          name: 'PT: eUSDe 28MAY2025',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: registerTokensMap[Network.mainnet]['SY-eUSDe'],
          address: registerTokensMap[Network.mainnet]['SY-eUSDe'],
          network: Network.mainnet,
          symbol: 'SY-eUSDe',
          name: 'SY eUSDe',
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
