import { Network, DexIds } from '@notional-finance/util';
import { defaultAbiCoder } from '@ethersproject/abi';

// Default slippage limit for all vaults
export const DEFAULT_SLIPPAGE_LIMIT = 0.01; // 1%

// Default PT slippage limit for PendlePT vaults
export const DEFAULT_PT_SLIPPAGE_LIMIT = 0.001; // 0.1%

// Default vault liquidation settings
// For scalability, set default parameters here and only set overrides in VaultLiquidationSettings
export const DEFAULT_VAULT_LIQUIDATION_SETTINGS = {
  liquidateYieldTokens: true,
  slippageLimit: DEFAULT_SLIPPAGE_LIMIT,
  ptSlippageLimit: DEFAULT_PT_SLIPPAGE_LIMIT,
} as const;

// Vault DEX parameters by network and vault address
export const VaultDefaultDexParameters = {
  [Network.mainnet]: {
    '0x7f723fee1e65a7d26be51a05af0b5efee4a7d5ae': {
      dexId: DexIds.CURVE_V2,
      redeemExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5', 1, 0]
      ),
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
    },
    '0xaf14d06a65c91541a5b2db627ecd1c92d7d9c48b': {
      dexId: DexIds.CURVE_V2,
      withdrawExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 0, 1]
      ),
    },
  },
  [Network.arbitrum]: {
    // Arbitrum vault configurations
  },
} as const;

// Vault liquidation settings by network and vault address
// Only specify overrides here - all vaults inherit from DEFAULT_VAULT_LIQUIDATION_SETTINGS
export const VaultLiquidationSettings = {
  [Network.mainnet]: {
    '0x7f723fee1e65a7d26be51a05af0b5efee4a7d5ae': {},
    '0x2716561755154eef59bc48eb13712510b27f167f': {},
    '0x0e61e810f0918081cbfd2ac8c97e5866daf3f622': {},
    '0xaf14d06a65c91541a5b2db627ecd1c92d7d9c48b': {
      liquidateYieldTokens: false,
    },
    '0x091356e6793a0d960174eaab4d470e39a99dd673': {
      vaultAssetEqualsWithdrawToken: true,
      slippageLimit: 0.0051,
    },
    '0x94f6cb4fae0eb3fa74e9847dff2ff52fd5ec7e6e': {
      vaultAssetEqualsWithdrawToken: true,
      slippageLimit: 0.0051,
    },
  },
  [Network.arbitrum]: {
    // Arbitrum vault liquidation settings
  },
} as const;
