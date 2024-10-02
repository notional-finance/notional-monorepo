import {
  Network,
  tokens,
  vaults as vaultAddresses,
} from '@notional-finance/util';

// all addresses must be properly checksummed
// mainnet
const rETH = tokens.mainnet.rETH;
const PYUSD = tokens.mainnet.PYUSD;
const USDC = tokens.mainnet.USDC;
const USDT = tokens.mainnet.USDT;
const crvUSD = tokens.mainnet.crvUSD;
const CRV = tokens.mainnet.CRV;
const CVX = tokens.mainnet.CVX;
const BAL = tokens.mainnet.BAL;
const AURA = tokens.mainnet.AURA;
const GHO = tokens.mainnet.GHO;
// arbitrum
const ARB_BAL = tokens.arbitrum.BAL;
const ARB_AURA = tokens.arbitrum.AURA;
const ARB_CRV = tokens.arbitrum.CRV;
const ARB = tokens.arbitrum.ARB;
const ARB_USDCe = tokens.arbitrum.USDCe;
const ARB_USDC = tokens.arbitrum.USDC;
const ARB_USDT = tokens.arbitrum.USDT;
const ARB_wstETH = tokens.arbitrum.wstETH;
const ARB_WBTC = tokens.arbitrum.WBTC;

export const ETH = '0x0000000000000000000000000000000000000000';

export const wEthMapper: Partial<Record<Network, string>> = {
  mainnet: tokens.mainnet.WETH,
  arbitrum: tokens.arbitrum.WETH,
};

// set minimum values for tokens that are going to be claim/sell (~$15 for arbitrum, ~$150 for mainnet)
// if token is also pool token it won't be sold
export const minTokenAmount = {
  [USDC]: Number(150e6).toString(),
  [PYUSD]: Number(150e6).toString(),
  [GHO]: Number(150e18).toString(),
  [CRV]: Number(230e18).toString(),
  [CVX]: Number(40e18).toString(),
  [BAL]: Number(30e18).toString(),
  [AURA]: Number(200e18).toString(),
  [ARB]: Number(7e18).toString(),
  [ARB_BAL]: Number(3.5e18).toString(),
  [ARB_AURA]: Number(21e18).toString(),
  [ARB_CRV]: Number(10e18).toString(),
};

export type Vault = {
  address: string;
  rewardTokens: Array<string>;
  reinvestToken: string;
  maxSellAmount?: Record<string, string>;
};
// tokens in the pool need to be in the same order as they are stored in the vault
// whatever TOKENS() method on vault returns
// token weight for Balancer pool token should be set to 0
export const vaults: Partial<Record<Network, Array<Vault>>> = {
  mainnet: [
    {
      address: vaultAddresses.mainnet.Convex_pyUSD_xUSDC,
      rewardTokens: [CRV, CVX, PYUSD],
      reinvestToken: USDC,
    },
    {
      address: vaultAddresses.mainnet.Convex_xUSDC_crvUSD,
      rewardTokens: [CRV, CVX],
      reinvestToken: USDC,
    },
    {
      address: vaultAddresses.mainnet.Convex_xUSDT_crvUSD,
      rewardTokens: [CRV, CVX],
      reinvestToken: USDT,
    },
    {
      address: vaultAddresses.mainnet.Aura_GHO_USDT_xUSDC,
      rewardTokens: [BAL, AURA, GHO],
      reinvestToken: USDC,
    },
    {
      address: vaultAddresses.mainnet.Aura_ezETH_xWETH,
      rewardTokens: [BAL, AURA],
      reinvestToken: ETH,
    },
    {
      address: vaultAddresses.mainnet.Aura_xrETH_weETH,
      rewardTokens: [BAL, AURA],
      reinvestToken: rETH,
    },
    {
      address: vaultAddresses.mainnet.Convex_xGHO_crvUSD,
      rewardTokens: [CRV, CVX],
      reinvestToken: crvUSD,
    },
    {
      address: vaultAddresses.mainnet.Balancer_rsETH_xWETH,
      rewardTokens: [USDC],
      reinvestToken: ETH,
    },
  ],
  arbitrum: [
    {
      address: vaultAddresses.arbitrum.Curve_xFRAX_USDC,
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_USDCe,
    },
    {
      address: vaultAddresses.arbitrum.Convex_USDCe_xUSDT,
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_USDT,
    },
    {
      address: vaultAddresses.arbitrum.Convex_crvUSD_xUSDC,
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_USDC,
    },
    {
      address: vaultAddresses.arbitrum.Convex_crvUSD_xUSDT,
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_USDT,
    },
    {
      address: vaultAddresses.arbitrum.Convex_xWBTC_tBTC,
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_WBTC,
    },
    {
      address: vaultAddresses.arbitrum.Aura_xrETH_WETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_xUSDC_DAI_USDT_USDCe,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ARB_USDC,
    },
    {
      address: vaultAddresses.arbitrum.Aura_wstETH_xWETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ETH,
      maxSellAmount: {
        [ARB]: '448500000000000000000', // 448.5e18
      },
    },
    {
      address: vaultAddresses.arbitrum.Aura_xwstETH_cbETH_rETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ARB_wstETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_ezETH_xwstETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ARB_wstETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_rETH_xWETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_rsETH_xWETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ETH,
    },
    {
      address: vaultAddresses.arbitrum.Aura_cbETH_xwstETH_rETH,
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      reinvestToken: ARB_wstETH,
    },
    {
      address: vaultAddresses.arbitrum.Convex_tBTC_xWBTC,
      rewardTokens: [ARB_CRV, ARB],
      reinvestToken: ARB_WBTC,
    },
  ],
};
