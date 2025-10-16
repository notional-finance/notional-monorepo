import { Network } from '@notional-finance/util';

// Default slippage limit for all vaults
export const DEFAULT_SLIPPAGE_LIMIT = 0.01; // 1%

// Vault DEX parameters by network and vault address
export const VaultDefaultDexParameters = {
  [Network.mainnet]: {
    // Example vault configurations - replace with actual vault addresses and parameters
    // '0x...vaultAddress': {
    //   dexId: 1,
    //   depositExchangeData: '0x...',
    //   redeemExchangeData: '0x...',
    //   withdrawExchangeData: '0x...',
    //   depositPoolAddress: '0x...',
    //   redeemPoolAddress: '0x...',
    //   withdrawPoolAddress: '0x...',
    // },
  },
  [Network.arbitrum]: {
    // Arbitrum vault configurations
  },
} as const;

// Vault liquidation settings by network and vault address
export const VaultLiquidationSettings = {
  [Network.mainnet]: {
    // Example liquidation settings - replace with actual vault addresses
    // '0x...vaultAddress': {
    //   liquidateYieldTokens: true,
    //   slippageLimit: DEFAULT_SLIPPAGE_LIMIT,
    // },
  },
  [Network.arbitrum]: {
    // Arbitrum vault liquidation settings
  },
} as const;