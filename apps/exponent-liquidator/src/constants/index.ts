import { Network } from '@notional-finance/util';

// Token addresses by network
export const TOKEN_ADDRESSES = {
  [Network.mainnet]: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  [Network.arbitrum]: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
} as const;

// Protocol contract addresses by network
export const CONTRACT_ADDRESSES = {
  [Network.mainnet]: {
    ADDRESS_REGISTRY: '0xe335d314BD4eF7DD44F103dC124FEFb7Ce63eC95',
  },
  [Network.arbitrum]: {
    ADDRESS_REGISTRY: '0xe335d314BD4eF7DD44F103dC124FEFb7Ce63eC95', // TODO: Update with correct Arbitrum address
  },
} as const;

// Helper functions to get addresses for a specific network
export const getTokenAddress = (network: Network, token: keyof typeof TOKEN_ADDRESSES[Network.mainnet]) => {
  return TOKEN_ADDRESSES[network]?.[token];
};

export const getContractAddress = (network: Network, contract: keyof typeof CONTRACT_ADDRESSES[Network.mainnet]) => {
  return CONTRACT_ADDRESSES[network]?.[contract];
};