import { Network, VaultAddress, vaults, DexIds } from '@notional-finance/util';
import { SingleSidedLP, VaultAdapter } from '../vaults';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BytesLike } from 'ethers';

export const PointsMultipliers: Record<
  Network,
  Record<string, (v: VaultAdapter) => Record<string, number>>
> = {
  [Network.mainnet]: {
    [vaults.mainnet.Aura_xrETH_weETH.toLowerCase()]: (v) => ({
      EtherFi: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(1),
    }),
    [vaults.mainnet.Aura_ezETH_xWETH.toLowerCase()]: (v) => ({
      Renzo: 6,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
    [vaults.mainnet.Curve_USDe_xUSDC.toLowerCase()]: (_v) => ({
      Ethena: 20,
    }),
    [vaults.mainnet.Convex_xGHO_USDe.toLowerCase()]: (_v) => ({
      Ethena: 20,
    }),
    [vaults.mainnet.Balancer_rsETH_xWETH.toLowerCase()]: (v) => ({
      Kelp: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    [vaults.arbitrum.Aura_ezETH_xwstETH.toLowerCase()]: (v) => ({
      Renzo: 6,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
    [vaults.arbitrum.Aura_rsETH_xWETH.toLowerCase()]: (v) => ({
      Kelp: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
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
  [Network.mainnet]: [],
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
        vaults.arbitrum.Pendle_rsETH_25SEP2024,
        vaults.arbitrum.Pendle_rsETH_26DEC2024,
      ].map(toLowercase);
  }
};

export const VaultDefaultDexParameters: Record<
  Network,
  Record<
    string,
    { dexId: DexIds; exchangeData: BytesLike; poolAddress?: string }
  >
> = {
  [Network.arbitrum]: {
    '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3': {
      dexId: DexIds.BALANCER_V2,
      exchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      poolAddress: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    },
    '0x878c46978ac67e43d9d27e510f98e087e9940b12': {
      dexId: DexIds.BALANCER_V2,
      exchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      poolAddress: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    },
  },
  [Network.mainnet]: {},
  [Network.all]: {},
};

const SingleSidedLP_DirectClaim: Record<Network, string[]> = {
  [Network.arbitrum]: [],
  [Network.mainnet]: [vaults.mainnet.Convex_xWBTC_tBTC].map(toLowercase),
  [Network.all]: [],
};

export type VaultType =
  | 'SingleSidedLP'
  | 'PendlePT'
  | 'SingleSidedLP_DirectClaim';

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
  }
  return 'SingleSidedLP';
}
