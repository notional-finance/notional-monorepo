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

// API URLs
export const PENDLE_API_URL = 'https://api-v2.pendle.finance/core/v1/sdk';

// Network mapping for Pendle API
export const NETWORK_IDS = {
  [Network.mainnet]: 1,
  [Network.arbitrum]: 42161,
};

// Type definitions for ABI encoding (Pendle)
export const ORDER_TYPE =
  'tuple(uint256 salt, uint256 expiry, uint256 nonce, uint8 orderType, address token, address YT, address maker, address receiver, uint256 makingAmount, uint256 lnImpliedRate, uint256 failSafeRate, bytes permit)';
export const FILL_ORDER_PARAMS_TYPE = `tuple(${ORDER_TYPE} order, bytes signature, uint256 makingAmount)`;
export const LIMIT_ORDER_TYPE = `tuple(address limitRouter, uint256 epsSkipMarket, ${FILL_ORDER_PARAMS_TYPE}[] normalFills, ${FILL_ORDER_PARAMS_TYPE}[] flashFills, bytes optData)`;