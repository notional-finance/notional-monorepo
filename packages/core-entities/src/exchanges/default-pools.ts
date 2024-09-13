import { Network } from '@notional-finance/util';
import { PoolDefinition } from '..';

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
      address: '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7',
      PoolClass: 'SNOTEWeightedPool',
      registerTokens: [
        {
          id: '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7',
          address: '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7',
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
      address: '0x383E6b4437b59fff47B619CBA855CA29342A8559',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x383E6b4437b59fff47B619CBA855CA29342A8559',
          address: '0x383E6b4437b59fff47B619CBA855CA29342A8559',
          network: Network.mainnet,
          symbol: 'PayPool',
          name: 'PYUSDUSDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
          address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
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
      address: '0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E',
          address: '0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E',
          network: Network.mainnet,
          symbol: 'crvUSDUSDC-f',
          name: 'Curve.fi Factory Plain Pool: crvUSD/USDT ',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
          address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
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
      address: '0x390f3595bCa2Df7d23783dFd126427CCeb997BF4',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x390f3595bCa2Df7d23783dFd126427CCeb997BF4',
          address: '0x390f3595bCa2Df7d23783dFd126427CCeb997BF4',
          network: Network.mainnet,
          symbol: 'crvUSDUSDT-f',
          name: 'Curve.fi Factory Plain Pool: crvUSD/USDT ',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
          address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
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
      address: '0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF',
          address: '0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF',
          network: Network.mainnet,
          symbol: 'GHO/USDT/USDC',
          name: 'Balancer GHO/USDT/USDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
          address: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
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
      address: '0x05ff47AFADa98a98982113758878F9A8B9FddA0a',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x05ff47AFADa98a98982113758878F9A8B9FddA0a',
          address: '0x05ff47AFADa98a98982113758878F9A8B9FddA0a',
          network: Network.mainnet,
          symbol: 'weETH/rETH',
          name: 'Balancer weETH/rETH StablePool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
          address: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
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
      address: '0x596192bB6e41802428Ac943D2f1476C1Af25CC0E',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x596192bB6e41802428Ac943D2f1476C1Af25CC0E',
          address: '0x596192bB6e41802428Ac943D2f1476C1Af25CC0E',
          network: Network.mainnet,
          symbol: 'ezETH-WETH-BPT',
          name: 'Balancer ezETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
          address: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
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
      address: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
          address: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
          network: Network.mainnet,
          symbol: 'USDeUSDC',
          name: 'USDe-USDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
          address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
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
      address: '0x635EF0056A597D13863B73825CcA297236578595',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x635EF0056A597D13863B73825CcA297236578595',
          address: '0x635EF0056A597D13863B73825CcA297236578595',
          network: Network.mainnet,
          symbol: 'GHOcrvUSD',
          name: 'GHO/crvUSD',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
          address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
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
      address: '0x670a72e6D22b0956C0D2573288F82DCc5d6E3a61',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x670a72e6D22b0956C0D2573288F82DCc5d6E3a61',
          address: '0x670a72e6D22b0956C0D2573288F82DCc5d6E3a61',
          network: Network.mainnet,
          symbol: 'GHOUSDe',
          name: 'GHOTHENA',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
          address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
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
      address: '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D',
          address: '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D',
          network: Network.mainnet,
          symbol: 'rsETH / WETH',
          name: 'Balancer rsETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7',
          address: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7',
          network: Network.mainnet,
          symbol: 'rsETH',
          name: 'rsETH',
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
      address: '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        // FRAX / USDC v1 pool
        {
          id: '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5',
          address: '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5',
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
      address: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        // USDT / USDC v1 pool
        {
          id: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
          address: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
          network: Network.arbitrum,
          symbol: '2CRV',
          name: 'Curve.fi USDC/USDT',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        // Register USDT
        {
          id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
          address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
          network: Network.arbitrum,
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
          address: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
          network: Network.arbitrum,
          symbol: '2CRV',
          name: 'Curve.fi USDC/USDT',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        // Register USDC.e
        {
          id: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
          address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
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
      address: '0x73af1150f265419ef8a5db41908b700c32d49135',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x73af1150f265419ef8a5db41908b700c32d49135',
          address: '0x73af1150f265419ef8a5db41908b700c32d49135',
          network: Network.arbitrum,
          symbol: 'crvUSDC',
          name: 'crvUSD/USDT',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5',
          address: '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5',
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
      address: '0xec090cf6dd891d2d014bea6edada6e05e025d93d',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0xec090cf6dd891d2d014bea6edada6e05e025d93d',
          address: '0xec090cf6dd891d2d014bea6edada6e05e025d93d',
          network: Network.arbitrum,
          symbol: 'crvUSDC',
          name: 'crvUSD/USDC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5',
          address: '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5',
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
      address: '0x9791d590788598535278552EEcD4b211bFc790CB',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x9791d590788598535278552EEcD4b211bFc790CB',
          address: '0x9791d590788598535278552EEcD4b211bFc790CB',
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
      address: '0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81',
          address: '0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81',
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
      address: '0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B',
          address: '0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B',
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
      address: '0x2d6CeD12420a9AF5a83765a8c48Be2aFcD1A8FEb',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x2d6CeD12420a9AF5a83765a8c48Be2aFcD1A8FEb',
          address: '0x2d6CeD12420a9AF5a83765a8c48Be2aFcD1A8FEb',
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
      address: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
          address: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
          network: Network.arbitrum,
          symbol: '4POOL-BPT',
          name: 'Balancer Stable 4pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        // Register USDC.e
        {
          id: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
          address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
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
      address: '0xB61371Ab661B1ACec81C699854D2f911070C059E',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0xB61371Ab661B1ACec81C699854D2f911070C059E',
          address: '0xB61371Ab661B1ACec81C699854D2f911070C059E',
          network: Network.arbitrum,
          symbol: 'ezETH/wstETH',
          name: 'Balancer ezETH/wstETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x2416092f143378750bb29b79ed961ab195cceea5',
          address: '0x2416092f143378750bb29b79ed961ab195cceea5',
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
      address: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
          address: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
          network: Network.arbitrum,
          symbol: 'rsETH/wETH',
          name: 'Balancer rsETH/wETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x4186BFC76E2E237523CBC30FD220FE055156b41F',
          address: '0x4186BFC76E2E237523CBC30FD220FE055156b41F',
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
      address: '0x755D6688AD74661Add2FB29212ef9153D40fcA46',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x755D6688AD74661Add2FB29212ef9153D40fcA46',
          address: '0x755D6688AD74661Add2FB29212ef9153D40fcA46',
          network: Network.arbitrum,
          symbol: '2BTC-f',
          name: 'Curve.fi Factory Plain Pool: 2BTC',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
          address: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
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
      address: '0xd0EC47c54cA5e20aaAe4616c25C825c7f48D4069',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0xd0EC47c54cA5e20aaAe4616c25C825c7f48D4069',
          address: '0xd0EC47c54cA5e20aaAe4616c25C825c7f48D4069',
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
      address: '0x186cF879186986A20aADFb7eAD50e3C20cb26CeC',
      PoolClass: 'Curve2TokenPoolV1_SelfLPTokenNoAdmin',
      registerTokens: [
        {
          id: '0x186cF879186986A20aADFb7eAD50e3C20cb26CeC',
          address: '0x186cF879186986A20aADFb7eAD50e3C20cb26CeC',
          network: Network.arbitrum,
          symbol: '2BTC-ng',
          name: '2BTC-ng',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.optimism]: [],
  [Network.all]: [],
};

export default defaultPools;
