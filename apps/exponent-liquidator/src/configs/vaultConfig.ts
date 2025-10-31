import { Network, DexIds } from '@notional-finance/util';
import { defaultAbiCoder } from '@ethersproject/abi';

// Default slippage limit for all vaults
export const DEFAULT_SLIPPAGE_LIMIT = 0.01; // 1%

// Default PT slippage limit for PendlePT vaults
export const DEFAULT_PT_SLIPPAGE_LIMIT = 0.001; // 0.1%

// Vault DEX parameters by network and vault address
export const VaultDefaultDexParameters = {
  [Network.mainnet]: {
    '0x7f723fee1e65a7d26be51a05af0b5efee4a7d5ae': {
      dexId: DexIds.CURVE_V2,
      redeemExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5', 1, 0]
      ),
      redeemPoolAddress: '0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5',
    },
    '0x2716561755154eef59bc48eb13712510b27f167f': {
      dexId: DexIds.CURVE_V2,
    },
    '0x0e61e810f0918081cbfd2ac8c97e5866daf3f622': {
      dexId: DexIds.CURVE_V2,
      redeemExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7', 0, 1]
      ),
      redeemPoolAddress: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
    },
  },
  [Network.arbitrum]: {
    // Arbitrum vault configurations
  },
} as const;

// Vault liquidation settings by network and vault address
export const VaultLiquidationSettings = {
  [Network.mainnet]: {
    '0x7f723fee1e65a7d26be51a05af0b5efee4a7d5ae': {
      liquidateYieldTokens: true,
      slippageLimit: DEFAULT_SLIPPAGE_LIMIT,
      ptSlippageLimit: DEFAULT_PT_SLIPPAGE_LIMIT,
    },
    '0x2716561755154eef59bc48eb13712510b27f167f': {
      liquidateYieldTokens: true,
      slippageLimit: DEFAULT_SLIPPAGE_LIMIT,
      ptSlippageLimit: DEFAULT_PT_SLIPPAGE_LIMIT,
    },
    '0x0e61e810f0918081cbfd2ac8c97e5866daf3f622': {
      liquidateYieldTokens: true,
      slippageLimit: DEFAULT_SLIPPAGE_LIMIT,
      ptSlippageLimit: DEFAULT_PT_SLIPPAGE_LIMIT,
    },
  },
  [Network.arbitrum]: {
    // Arbitrum vault liquidation settings
  },
} as const;