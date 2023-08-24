import { ALT_ETH, Network } from '@notional-finance/util';
import { PoolDefinition } from '..';

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
    },
    {
      // nUSDT
      address: '0x9c0Fbb8caDE7B178b135fD2F1da125a37B27f442',
      PoolClass: 'fCashMarket',
      registerTokens: [],
    },
    {
      address: '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5',
      PoolClass: 'Curve2TokenPoolV1_SelfLPToken',
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
      address: '0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f',
      PoolClass: 'MetaStablePool',
      registerTokens: [
        // ETH / wstETH Pool
        {
          id: '0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f',
          address: '0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f',
          network: Network.ArbitrumOne,
          symbol: 'B-wstETH-WETH-Stable',
          name: 'Balancer wstETH-WETH Stable Pool',
          decimals: 18,
          tokenInterface: 'ERC20',
          tokenType: 'Underlying',
        },
        {
          id: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          network: Network.ArbitrumOne,
          symbol: 'WETH',
          name: 'WETH',
          decimals: 18,
          tokenInterface: 'ERC20', // TODO: change this to Ether interface
          tokenType: 'Underlying',
        },
      ],
    },
  ],
  [Network.All]: [],
};

export default defaultPools;
