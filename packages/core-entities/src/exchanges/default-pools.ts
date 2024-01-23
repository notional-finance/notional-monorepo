import { ALT_ETH, Network } from '@notional-finance/util';
import { PoolDefinition } from '..';

const defaultPools: Record<Network, PoolDefinition[]> = {
  [Network.Goerli]: [
    // TODO: add nTokens
  ],
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
    {
      address: '0x5FAE7E604FC3e24fd43A72867ceBaC94c65b404A',
      PoolClass: 'Curve2TokenPoolV2',
      registerTokens: [
        {
          id: '0x5b6C539b224014A09B3388e51CaAA8e354c959C8',
          address: '0x5b6C539b224014A09B3388e51CaAA8e354c959C8',
          network: Network.Mainnet,
          symbol: 'cbETH/ETH-f',
          name: 'Curve.fi Factory Crypto Pool: cbETH/ETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.ArbitrumOne]: [
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
          network: Network.ArbitrumOne,
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
      PoolClass: 'Curve2TokenPoolV1_SelfLPToken',
      registerTokens: [
        // USDT / USDC v1 pool
        {
          id: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
          address: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
          network: Network.ArbitrumOne,
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
          network: Network.ArbitrumOne,
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      // NOTE: the pool address here is different from the lp token address
      address: '0x6eB2dc694eB516B16Dc9FBc678C60052BbdD7d80',
      PoolClass: 'Curve2TokenPoolV1_HasOracle',
      registerTokens: [
        // ETH / wstETH Pool
        {
          id: '0xDbcD16e622c95AcB2650b38eC799f76BFC557a0b',
          address: '0xDbcD16e622c95AcB2650b38eC799f76BFC557a0b',
          network: Network.ArbitrumOne,
          symbol: 'wstETHCRV',
          name: 'Curve.fi ETH/wstETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        // Register ALT_ETH
        {
          id: ALT_ETH,
          address: ALT_ETH,
          network: Network.ArbitrumOne,
          symbol: 'ETH [Alt]',
          name: 'Ether [Alternate]',
          decimals: 18,
          tokenInterface: 'ERC20', // TODO: change this to Ether interface
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
          network: Network.ArbitrumOne,
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
          network: Network.ArbitrumOne,
          symbol: 'rETH-WETH-BPT',
          name: 'Balancer rETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: '0x4a2f6ae7f3e5d715689530873ec35593dc28951b',
      PoolClass: 'ComposableStablePool',
      registerTokens: [
        {
          id: '0x4a2f6ae7f3e5d715689530873ec35593dc28951b',
          address: '0x4a2f6ae7f3e5d715689530873ec35593dc28951b',
          network: Network.ArbitrumOne,
          symbol: 'wstETH/rETH/cbETH',
          name: 'Balancer wstETH/rETH/cbETH CSP',
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
          network: Network.ArbitrumOne,
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
          network: Network.ArbitrumOne,
          symbol: 'USDC.e',
          name: 'USD Coin (Arb1)',
          decimals: 6,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
    {
      address: '0x32dF62dc3aEd2cD6224193052Ce665DC18165841',
      PoolClass: 'WeightedPool',
      registerTokens: [
        {
          id: '0x32dF62dc3aEd2cD6224193052Ce665DC18165841',
          address: '0x32dF62dc3aEd2cD6224193052Ce665DC18165841',
          network: Network.ArbitrumOne,
          symbol: 'RDNT-WETH ',
          name: 'RDNT-WETH',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.Optimism]: [],
  [Network.All]: [],
};

export default defaultPools;
