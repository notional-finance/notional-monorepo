import { Network, VaultAddress, vaults, DexIds } from '@notional-finance/util';
import { VaultAdapter } from '../vaults';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BytesLike } from 'ethers';

export const PointsMultipliers: Record<
  Network,
  Record<string, (v: VaultAdapter) => Record<string, number>>
> = {
  [Network.mainnet]: {
    // [vaults.mainnet.Curve_USDe_xUSDC.toLowerCase()]: (_v) => ({
    //   Ethena: 20,
    // }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {},
};

export const PointsLinks: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    // [vaults.mainnet.Aura_xrETH_weETH.toLowerCase()]:
    //   'https://app.ether.fi/defi',
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

/** @dev all vault addresses should be lowercased */
export const whitelistedVaults = (
  network: Network
): Lowercase<VaultAddress>[] => {
  switch (network) {
    case Network.all:
      return [];
    case Network.mainnet:
      return [
        vaults.mainnet.Staking_sUSDe,
        vaults.mainnet.Staking_weETH,
        vaults.mainnet.Pendle_sUSDe_27NOV2025,
      ].map(toLowercase);
    case Network.arbitrum:
      return [].map(toLowercase);
  }
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
  },
  [Network.all]: {},
};

export const VAULT_TYPES = [
  'Staking',
  'CurveConvex2Token',
  'PendlePT',
] as const;

export type VaultType = (typeof VAULT_TYPES)[number];

export function getVaultType(
  vaultAddress: string,
  network: Network
): VaultType {
  if (PendlePTVaults[network].includes(vaultAddress.toLowerCase())) {
    return 'PendlePT';
  } else {
    return 'Staking';
  }
}
