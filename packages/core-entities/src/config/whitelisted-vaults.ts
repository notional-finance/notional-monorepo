import { Network, VaultAddress, vaults, DexIds } from '@notional-finance/util';
import { VaultAdapter } from '../vaults';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BytesLike } from 'ethers';

export const PointsMultipliers: Record<
  Network,
  Record<string, (v: VaultAdapter) => Record<string, number>>
> = {
  [Network.mainnet]: {
    [vaults.mainnet.Aura_xrETH_weETH.toLowerCase()]: () => ({
      EtherFi: 2,
    }),
    [vaults.mainnet.Curve_USDe_xUSDC.toLowerCase()]: (_v) => ({
      Ethena: 20,
    }),
    [vaults.mainnet.Convex_xGHO_USDe.toLowerCase()]: (_v) => ({
      Ethena: 20,
    }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {},
};

export const PointsLinks: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    [vaults.mainnet.Aura_xrETH_weETH.toLowerCase()]:
      'https://app.ether.fi/defi',
    [vaults.mainnet.Aura_ezETH_xWETH.toLowerCase()]:
      'https://app.renzoprotocol.com/defi',
    [vaults.mainnet.Curve_USDe_xUSDC.toLowerCase()]:
      'https://app.ethena.fi/join',
    [vaults.mainnet.Convex_xGHO_USDe.toLowerCase()]:
      'https://app.ethena.fi/join',
    [vaults.mainnet.Balancer_rsETH_xWETH.toLowerCase()]:
      'https://kelpdao.xyz/dashboard/',
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    [vaults.arbitrum.Aura_ezETH_xwstETH.toLowerCase()]:
      'https://app.renzoprotocol.com/defi',
  },
};

const toLowercase = <T extends string>(s: T): Lowercase<T> =>
  s.toLowerCase() as Lowercase<T>;

export const PendlePTVaults: Record<Network, string[]> = {
  [Network.arbitrum]: [
    vaults.arbitrum.Pendle_rsETH_25SEP2024,
    vaults.arbitrum.Pendle_rsETH_26DEC2024,
  ].map(toLowercase),
  [Network.mainnet]: [
    vaults.mainnet.Pendle_ezETH_25DEC2024,
    vaults.mainnet.Pendle_USDe_25DEC2024,
    vaults.mainnet.Pendle_USDe_26MAR2025,
    vaults.mainnet.Pendle_sUSDe_28MAY2025,
    vaults.mainnet.Pendle_USDe_30JUL2025,
    vaults.mainnet.Pendle_sUSDe_30JUL2025,
    vaults.mainnet.Pendle_USDe_28MAY2025,
  ].map(toLowercase),
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
      return [vaults.mainnet.Staking_sUSDe].map(toLowercase);
    case Network.arbitrum:
      return [].map(toLowercase);
  }
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
    ['0xaf14d06a65c91541a5b2db627ecd1c92d7d9c48b'.toLowerCase()]: {
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
    },
    ['0x7f723fee1e65a7d26be51a05af0b5efee4a7d5ae'.toLowerCase()]: {
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

const SingleSidedLP_DirectClaim: Record<Network, string[]> = {
  [Network.arbitrum]: [],
  [Network.mainnet]: [vaults.mainnet.Convex_xWBTC_tBTC].map(toLowercase),
  [Network.all]: [],
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

export function getVaultDocsLink(
  vaultAddress?: string,
  network?: Network
): string {
  if (
    vaultAddress &&
    network &&
    PendlePTVaults[network].includes(vaultAddress.toLowerCase())
  ) {
    return 'https://docs.notional.finance/notional-v3/product-guides/leveraged-pendle-pts';
  } else if (
    vaultAddress &&
    network &&
    SingleSidedLP_DirectClaim[network].includes(vaultAddress.toLowerCase())
  ) {
    return 'https://docs.notional.finance/notional-v3/product-guides/leveraged-yield-farming';
  } else if (
    vaultAddress &&
    network &&
    Object.keys(PointsMultipliers[network]).includes(vaultAddress.toLowerCase())
  ) {
    return 'https://docs.notional.finance/notional-v3/product-guides/leveraged-points-farming';
  } else {
    return 'https://docs.notional.finance/notional-v3/product-guides/leveraged-yield-farming';
  }
}
