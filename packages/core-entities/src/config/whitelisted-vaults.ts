import { Network, vaults, DexIds } from '@notional-finance/util';
import { VaultAdapter } from '../vaults';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BytesLike } from 'ethers';

export const PointsMultipliers: Record<
  Network,
  Record<string, (v: VaultAdapter) => Record<string, number>>
> = {
  [Network.mainnet]: {
    [vaults.mainnet.InfiniFi_liUSD_4w.toLowerCase()]: (_v) => ({
      InfiniFi: 1,
    }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {},
};

export const PointsLinks: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    [vaults.mainnet.InfiniFi_liUSD_4w.toLowerCase()]: 'https://infinifi.xyz/',
    // [vaults.mainnet.Aura_ezETH_xWETH.toLowerCase()]:
    //   'https://app.renzoprotocol.com/defi',
    // [vaults.mainnet.Curve_USDe_xUSDC.toLowerCase()]:
    //   'https://app.ethena.fi/join',
    // [vaults.mainnet.Convex_xGHO_USDe.toLowerCase()]:
    //   'https://app.ethena.fi/join',
    // [vaults.mainnet.Balancer_rsETH_xWETH.toLowerCase()]:
    //   'https://kelpdao.xyz/dashboard/',
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    // [vaults.arbitrum.Aura_ezETH_xwstETH.toLowerCase()]:
    //   'https://app.renzoprotocol.com/defi',
  },
};

const toLowercase = <T extends string>(s: T): Lowercase<T> =>
  s.toLowerCase() as Lowercase<T>;

export const PendlePTVaults: Record<Network, string[]> = {
  [Network.arbitrum]: [].map(toLowercase),
  [Network.mainnet]: [vaults.mainnet.Pendle_sUSDe_27NOV2025].map(toLowercase),
  [Network.all]: [],
};

const sUSDe_DEFAULT_DEX_PARAMETERS = {
  dexId: DexIds.CURVE_V2,
  // On entry, the trade is from USDC to USDe
  depositExchangeData: defaultAbiCoder.encode(
    ['address', 'int128', 'int128'],
    ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 1, 0]
  ),
  depositPoolAddress: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
  // On exit, the trade is from DAI to USDC
  redeemExchangeData: defaultAbiCoder.encode(
    ['address', 'int128', 'int128'],
    ['0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7', 0, 1]
  ),
  redeemPoolAddress: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
  // On Exit Finalize Withdraw, the trade is from USDe to USDC
  withdrawExchangeData: defaultAbiCoder.encode(
    ['address', 'int128', 'int128'],
    ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 0, 1]
  ),
  withdrawPoolAddress: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
};

export const VaultDefaultDexParameters: Record<
  Network,
  Record<
    string,
    {
      dexId: DexIds;
      depositExchangeData: BytesLike;
      redeemExchangeData: BytesLike;
      withdrawExchangeData?: BytesLike;
      depositPoolAddress?: string;
      redeemPoolAddress?: string;
      withdrawPoolAddress?: string;
    }
  >
> = {
  [Network.arbitrum]: {},
  [Network.mainnet]: {
    [vaults.mainnet.Staking_sUSDe.toLowerCase()]: sUSDe_DEFAULT_DEX_PARAMETERS,
    [vaults.mainnet.Pendle_sUSDe_27NOV2025.toLowerCase()]:
      sUSDe_DEFAULT_DEX_PARAMETERS,
    [vaults.mainnet.Staking_weETH.toLowerCase()]: {
      dexId: DexIds.CURVE_V2,
      depositExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5', 0, 1]
      ),
      depositPoolAddress: '0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5',
      redeemExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5', 1, 0]
      ),
      redeemPoolAddress: '0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5',
    },
    [vaults.mainnet.Staking_mHYPER.toLowerCase()]: {
      dexId: DexIds.UNKNOWN,
      depositPoolAddress: '0x18f86644781fc9F7B4641D371f377c96744EC10F',
      redeemPoolAddress: '0x18f86644781fc9F7B4641D371f377c96744EC10F',
      withdrawPoolAddress: '0x18f86644781fc9F7B4641D371f377c96744EC10F',
      depositExchangeData: '0x',
      redeemExchangeData: '0x',
      withdrawExchangeData: '0x',
    },
    [vaults.mainnet.Staking_mAPOLLO.toLowerCase()]: {
      dexId: DexIds.UNKNOWN,
      depositPoolAddress: '0xE4ebB6EA270a70491c3Af06376a5862a0fdA7268',
      redeemPoolAddress: '0xE4ebB6EA270a70491c3Af06376a5862a0fdA7268',
      withdrawPoolAddress: '0xE4ebB6EA270a70491c3Af06376a5862a0fdA7268',
      depositExchangeData: '0x',
      redeemExchangeData: '0x',
      withdrawExchangeData: '0x',
    },
  },
  [Network.all]: {},
};

export const VAULT_TYPES = [
  'Staking',
  'CurveConvex2Token',
  'PendlePT',
  'MidasStaking',
] as const;

export type VaultType = (typeof VAULT_TYPES)[number];
