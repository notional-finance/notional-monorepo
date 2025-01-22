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
    [vaults.mainnet.Aura_ezETH_xWETH.toLowerCase()]: () => ({
      Renzo: 6,
    }),
    [vaults.mainnet.Curve_USDe_xUSDC.toLowerCase()]: (_v) => ({
      Ethena: 20,
    }),
    [vaults.mainnet.Convex_xGHO_USDe.toLowerCase()]: (_v) => ({
      Ethena: 20,
    }),
    [vaults.mainnet.Balancer_rsETH_xWETH.toLowerCase()]: () => ({
      Kelp: 2,
    }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    [vaults.arbitrum.Aura_ezETH_xwstETH.toLowerCase()]: () => ({
      Renzo: 6,
    }),
    [vaults.arbitrum.Aura_rsETH_xWETH.toLowerCase()]: () => ({
      Kelp: 2,
    }),
  },
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

const PendlePTVaults: Record<Network, string[]> = {
  [Network.arbitrum]: [
    vaults.arbitrum.Pendle_rsETH_25SEP2024,
    vaults.arbitrum.Pendle_rsETH_26DEC2024,
  ].map(toLowercase),
  [Network.mainnet]: [
    vaults.mainnet.Pendle_ezETH_25DEC2024,
    vaults.mainnet.Pendle_USDe_25DEC2024,
    vaults.mainnet.Pendle_USDe_26MAR2025,
    vaults.mainnet.Pendle_sUSDe_28MAY2025,
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
      return [
        vaults.mainnet.Aura_GHO_USDT_xUSDC,
        vaults.mainnet.Aura_xrETH_weETH,
        vaults.mainnet.Aura_ezETH_xWETH,
        vaults.mainnet.Curve_USDe_xUSDC,
        vaults.mainnet.Convex_xGHO_crvUSD,
        vaults.mainnet.Convex_xGHO_USDe,
        vaults.mainnet.Balancer_rsETH_xWETH,
        vaults.mainnet.Convex_xWBTC_tBTC,
        vaults.mainnet.Pendle_ezETH_25DEC2024,
        vaults.mainnet.Pendle_USDe_25DEC2024,
        vaults.mainnet.Pendle_USDe_26MAR2025,
      ].map(toLowercase);
    case Network.arbitrum:
      return [
        vaults.arbitrum.Curve_xFRAX_USDC,
        vaults.arbitrum.Convex_USDCe_xUSDT,
        vaults.arbitrum.Convex_crvUSD_xUSDC,
        vaults.arbitrum.Convex_crvUSD_xUSDT,
        vaults.arbitrum.Aura_xrETH_WETH,
        vaults.arbitrum.Aura_xUSDC_DAI_USDT_USDCe,
        vaults.arbitrum.Aura_wstETH_xWETH,
        vaults.arbitrum.Aura_xwstETH_cbETH_rETH,
        vaults.arbitrum.Aura_rETH_xWETH,
        vaults.arbitrum.Aura_ezETH_xwstETH,
        vaults.arbitrum.Convex_xWBTC_tBTC,
        vaults.arbitrum.Aura_rsETH_xWETH,
        vaults.arbitrum.Aura_cbETH_xwstETH_rETH,
        vaults.arbitrum.Convex_tBTC_xWBTC,
      ].map(toLowercase);
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
      poolAddress?: string;
    }
  >
> = {
  [Network.arbitrum]: {
    [vaults.arbitrum.Pendle_rsETH_25SEP2024.toLowerCase()]: {
      dexId: DexIds.BALANCER_V2,
      depositExchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      redeemExchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      poolAddress: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    },
    [vaults.arbitrum.Pendle_rsETH_26DEC2024.toLowerCase()]: {
      dexId: DexIds.BALANCER_V2,
      depositExchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      redeemExchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      poolAddress: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    },
  },
  [Network.mainnet]: {
    [vaults.mainnet.Pendle_ezETH_25DEC2024.toLowerCase()]: {
      dexId: DexIds.BALANCER_V2,
      depositExchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x596192bb6e41802428ac943d2f1476c1af25cc0e000000000000000000000659']
      ),
      redeemExchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x596192bb6e41802428ac943d2f1476c1af25cc0e000000000000000000000659']
      ),
      poolAddress: '0x596192bb6e41802428ac943d2f1476c1af25cc0e',
    },
    [vaults.mainnet.Pendle_USDe_25DEC2024.toLowerCase()]: {
      dexId: DexIds.CURVE_V2,
      depositExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 1, 0]
      ),
      redeemExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 0, 1]
      ),
      poolAddress: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
    },
    [vaults.mainnet.Pendle_USDe_26MAR2025.toLowerCase()]: {
      dexId: DexIds.CURVE_V2,
      depositExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 1, 0]
      ),
      redeemExchangeData: defaultAbiCoder.encode(
        ['address', 'int128', 'int128'],
        ['0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72', 0, 1]
      ),
      poolAddress: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
    },
  },
  [Network.all]: {},
};

const SingleSidedLP_DirectClaim: Record<Network, string[]> = {
  [Network.arbitrum]: [],
  [Network.mainnet]: [vaults.mainnet.Convex_xWBTC_tBTC].map(toLowercase),
  [Network.all]: [],
};

export type VaultType =
  | 'SingleSidedLP_AutoReinvest'
  | 'SingleSidedLP_DirectClaim'
  | 'SingleSidedLP_Points'
  | 'PendlePT';

export function getVaultType(
  vaultAddress: string,
  network: Network
): VaultType {
  if (PendlePTVaults[network].includes(vaultAddress.toLowerCase())) {
    return 'PendlePT';
  } else if (
    SingleSidedLP_DirectClaim[network].includes(vaultAddress.toLowerCase())
  ) {
    return 'SingleSidedLP_DirectClaim';
  } else if (
    Object.keys(PointsMultipliers[network]).includes(vaultAddress.toLowerCase())
  ) {
    return 'SingleSidedLP_Points';
  } else {
    return 'SingleSidedLP_AutoReinvest';
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
