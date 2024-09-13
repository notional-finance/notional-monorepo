import { whitelistedVaults } from '@notional-finance/core-entities';
import {
  ArbitrumToken,
  ArbitrumVaults,
  MainnetToken,
  MainnetVaults,
  Network,
  tokens,
  vaults as vaultAddresses,
} from '@notional-finance/util';

const m = tokens.mainnet;
const a = tokens.arbitrum;

// set minimum values for tokens that are going to be claim/sell (~$15 for arbitrum, ~$150 for mainnet)
// if token is also pool token it won't be sold
export const minTokenAmount = {
  [m.USDC]: Number(150e6).toString(),
  [m.PYUSD]: Number(150e6).toString(),
  [m.GHO]: Number(150e18).toString(),
  [m.CRV]: Number(230e18).toString(),
  [m.CVX]: Number(40e18).toString(),
  [m.BAL]: Number(30e18).toString(),
  [m.AURA]: Number(200e18).toString(),
  [a.ARB]: Number(7e18).toString(),
  [a.BAL]: Number(3.5e18).toString(),
  [a.AURA]: Number(21e18).toString(),
  [a.CRV]: Number(30e18).toString(),
};

export type Vault<T extends string, V extends string> = {
  address: V;
  rewardTokens: Array<T>;
  reinvestToken: T;
  maxSellAmount?: Partial<Record<T, string>>;
};
type Vaults = {
  [Network.mainnet]: Array<Vault<MainnetToken, MainnetVaults>>;
  [Network.arbitrum]: Array<Vault<ArbitrumToken, ArbitrumVaults>>;
  [Network.all]: Array<Vault<MainnetToken, MainnetVaults>>;
};

export const vaults: Vaults = {
  all: [],
  mainnet: [
    {
      address: vaultAddresses.mainnet.Convex_pyUSD_xUSDC,
      rewardTokens: [m.CRV, m.CVX, m.PYUSD],
      reinvestToken: m.USDC,
    },
    {
      address: vaultAddresses.mainnet.Convex_xUSDC_crvUSD,
      rewardTokens: [m.CRV, m.CVX],
      reinvestToken: m.USDC,
    },
    {
      address: vaultAddresses.mainnet.Convex_xUSDT_crvUSD,
      rewardTokens: [m.CRV, m.CVX],
      reinvestToken: m.USDT,
    },
    {
      address: vaultAddresses.mainnet.Aura_GHO_USDT_xUSDC,
      rewardTokens: [m.BAL, m.AURA, m.GHO],
      reinvestToken: m.USDC,
    },
    {
      address: vaultAddresses.mainnet.Aura_ezETH_xWETH,
      rewardTokens: [m.BAL, m.AURA],
      reinvestToken: m.ETH,
    },
    {
      address: vaultAddresses.mainnet.Aura_xrETH_weETH,
      rewardTokens: [m.BAL, m.AURA],
      reinvestToken: m.rETH,
    },
    {
      address: vaultAddresses.mainnet.Convex_xGHO_crvUSD,
      rewardTokens: [m.CRV, m.CVX],
      reinvestToken: m.crvUSD,
    },
    {
      address: vaultAddresses.mainnet.Balancer_rsETH_xWETH,
      rewardTokens: [m.USDC],
      reinvestToken: m.ETH,
    },
  ],
  arbitrum: [
    {
      address: vaultAddresses.arbitrum.Curve_xFRAX_USDC,
      rewardTokens: [a.CRV, a.ARB],
      reinvestToken: a.USDCe,
    },
    {
      address: vaultAddresses.arbitrum.Convex_USDCe_xUSDT,
      rewardTokens: [a.CRV, a.ARB],
      reinvestToken: a.USDT,
    },
    {
      address: vaultAddresses.arbitrum.Convex_crvUSD_xUSDC,
      rewardTokens: [a.CRV, a.ARB],
      reinvestToken: a.USDC,
    },
    {
      address: vaultAddresses.arbitrum.Convex_crvUSD_xUSDT,
      rewardTokens: [a.CRV, a.ARB],
      reinvestToken: a.USDT,
    },
    {
      address: vaultAddresses.arbitrum.Convex_xWBTC_tBTC,
      rewardTokens: [a.CRV, a.ARB],
      reinvestToken: a.WBTC,
    },
    {
      address: vaultAddresses.arbitrum.Aura_xrETH_WETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.ETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_xUSDC_DAI_USDT_USDCe,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.USDC,
    },
    {
      address: vaultAddresses.arbitrum.Aura_wstETH_xWETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.ETH,
      maxSellAmount: {
        [a.ARB]: Number(448.5e18).toString(),
      },
    },
    {
      address: vaultAddresses.arbitrum.Aura_xwstETH_cbETH_rETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.wstETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_ezETH_xwstETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.wstETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_rETH_xWETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.ETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_rsETH_xWETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.ETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_cbETH_xwstETH_rETH,
      rewardTokens: [a.BAL, a.AURA],
      reinvestToken: a.wstETH,
    },
    {
      address: vaultAddresses.arbitrum.Convex_tBTC_xWBTC,
      rewardTokens: [a.CRV, a.ARB],
      reinvestToken: a.WBTC,
    },
    {
      address: '0x3533F05B2C54Ce1C2321cfe3c6F693A3cBbAEa10',
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_WBTC,
    },
  ],
};

export const getVaultsForReinvestment = (network: Network, all = false) => {
  if (all) {
    return vaults[network];
  }

  const whitelisted = whitelistedVaults(network);
  return vaults[network].filter((vault) =>
    whitelisted.some((address) => address === vault.address.toLowerCase())
  );
};
