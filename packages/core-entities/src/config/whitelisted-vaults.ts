import { Network, VaultAddress, vaults } from '@notional-finance/util';
import { SingleSidedLP, VaultAdapter } from '../vaults';

export const PointsMultipliers: Record<
  Network,
  Record<string, (v: VaultAdapter) => Record<string, number>>
> = {
  [Network.mainnet]: {
    '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1': (v) => ({
      EtherFi: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(1),
    }),
    '0x914255c0c289aea36e378ebb5e28293b5ed278ca': (v) => ({
      Renzo: 6,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
    '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021': (_v) => ({
      Ethena: 20,
    }),
    '0xb1113cf888a019693b254da3d90f841072d85172': (_v) => ({
      Ethena: 20,
    }),
    '0xf94507f3dece4cc4c73b6cf228912b85eadc9cfb': (v) => ({
      Kelp: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937': (v) => ({
      Renzo: 6,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
    '0xcac9c01d1207e5d06bb0fd5b854832f35fe97e68': (v) => ({
      Kelp: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
  },
};

export const PointsLinks: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1': 'https://app.ether.fi/defi',
    '0x914255c0c289aea36e378ebb5e28293b5ed278ca':
      'https://app.renzoprotocol.com/defi',
    '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021': 'https://app.ethena.fi/join',
    '0xb1113cf888a019693b254da3d90f841072d85172': 'https://app.ethena.fi/join',
    '0xf94507f3dece4cc4c73b6cf228912b85eadc9cfb':
      'https://kelpdao.xyz/dashboard/',
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937':
      'https://app.renzoprotocol.com/defi',
  },
};

const toLowercase = <T extends string>(s: T): Lowercase<T> =>
  s.toLowerCase() as Lowercase<T>;
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
