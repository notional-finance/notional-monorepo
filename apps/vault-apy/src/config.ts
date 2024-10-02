import assert from 'node:assert/strict';
import { Network, RewardPoolType, VaultDataBase } from './types';
import {
  tokens,
  vaults,
  treasuryManagerAddresses,
  AlchemyUrl,
  tradingModuleAddresses,
  DATA_SERVICE_URL,
} from '@notional-finance/util';

export type Config = {
  chainId: number;
  dataServiceUrl: string;
  alchemyUrl: string;
  addresses: Record<string, string>;
  vaults: VaultDataBase[];
};
type ConfigPerNetwork = Record<Network, Config>;

const ALCHEMY_KEY = process.env.ALCHEMY_KEY as string;

assert(ALCHEMY_KEY, `Environment variable ALCHEMY_KEY needs to be set`);
assert(
  process.env.DATA_SERVICE_AUTH_TOKEN,
  `Environment variable DATA_SERVICE_AUTH_TOKEN needs to be set`
);

export const POOL_DECIMALS = 18;

const config: ConfigPerNetwork = {
  [Network.mainnet]: {
    chainId: 1,
    dataServiceUrl: DATA_SERVICE_URL,
    alchemyUrl: `${AlchemyUrl.mainnet}/${ALCHEMY_KEY}`,
    addresses: {
      treasuryManager: treasuryManagerAddresses.mainnet,
      tradingModule: tradingModuleAddresses.mainnet,
    },
    vaults: [
      {
        address: vaults.mainnet.Aura_GHO_USDT_xUSDC,
        gauge: '0xBDD6984C3179B099E9D383ee2F44F3A57764BF7d',
        primaryBorrowCurrency: tokens.mainnet.USDC,
        rewardPoolType: RewardPoolType.Aura,
      },
      // rETH/weETH
      {
        address: vaults.mainnet.Aura_xrETH_weETH,
        gauge: '0x07a319a023859bbd49cc9c38ee891c3ea9283cc5',
        primaryBorrowCurrency: tokens.mainnet.rETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // ezETH/wETH
      {
        address: vaults.mainnet.Aura_ezETH_xWETH,
        gauge: '0x95ec73baa0ecf8159b4ee897d973e41f51978e50',
        primaryBorrowCurrency: tokens.mainnet.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // USDe/USDC
      {
        address: vaults.mainnet.Curve_USDe_xUSDC,
        gauge: '0x04e80db3f84873e4132b221831af1045d27f140f',
        pool: '0x02950460e2b9529d0e00284a5fa2d7bdf3fa4d72',
        primaryBorrowCurrency: tokens.mainnet.USDC,
        rewardPoolType: RewardPoolType.Curve,
      },
      // GHO/crvUSD
      {
        address: vaults.mainnet.Convex_xGHO_crvUSD,
        gauge: '0x5eC758f79b96AE74e7F1Ba9583009aFB3fc8eACB',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.ConvexMainnet,
      },
      // GHO/USDe
      {
        address: vaults.mainnet.Convex_xGHO_USDe,
        gauge: '0x8eD00833BE7342608FaFDbF776a696afbFEaAe96',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.Curve,
      },
      // rsETH/WETH
      {
        address: vaults.mainnet.Balancer_rsETH_xWETH,
        gauge: '0xB5FdB4f75C26798A62302ee4959E4281667557E0',
        primaryBorrowCurrency: tokens.mainnet.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // tBTC/WBTC
      {
        address: '0xe20048fa0f165a49b780dfa9a8caba845332f848',
        gauge: '0x5793691B4ba69665213614d7ac722Db2d3f41927',
        primaryBorrowCurrency: tokens.mainnet.WBTC,
        rewardPoolType: RewardPoolType.ConvexMainnet,
      },
    ],
  },
  [Network.arbitrum]: {
    chainId: 42161,
    dataServiceUrl: DATA_SERVICE_URL,
    alchemyUrl: `${AlchemyUrl.arbitrum}/${ALCHEMY_KEY}`,
    addresses: {
      treasuryManager: treasuryManagerAddresses.arbitrum,
      tradingModule: tradingModuleAddresses.arbitrum,
    },
    vaults: [
      {
        address: vaults.arbitrum.Convex_crvUSD_xUSDC,
        gauge: '0xBFEE9F3E015adC754066424AEd535313dc764116',
        primaryBorrowCurrency: tokens.arbitrum.USDC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      {
        address: vaults.arbitrum.Convex_crvUSD_xUSDT,
        gauge: '0xf74d4C9b0F49fb70D8Ff6706ddF39e3a16D61E67',
        primaryBorrowCurrency: tokens.arbitrum.USDT,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      {
        address: vaults.arbitrum.Convex_xWBTC_tBTC,
        gauge: '0x6B7B84F6EC1c019aF08C7A2F34D3C10cCB8A8eA6',
        primaryBorrowCurrency: tokens.arbitrum.WBTC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      {
        address: vaults.arbitrum.Convex_USDCe_xUSDT,
        gauge: '0x971E732B5c91A59AEa8aa5B0c763E6d648362CF8',
        primaryBorrowCurrency: tokens.arbitrum.USDT,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      {
        address: vaults.arbitrum.Aura_ezETH_xwstETH,
        gauge: '0xc3c454095a988013c4d1a9166c345f7280332e1a',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_xUSDC_DAI_USDT_USDCe,
        gauge: '0x416c7ad55080ab8e294bead9b8857266e3b3f28e',
        primaryBorrowCurrency: tokens.arbitrum.USDC,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Curve_xFRAX_USDC,
        gauge: '0x93729702Bf9E1687Ae2124e191B8fFbcC0C8A0B0',
        primaryBorrowCurrency: tokens.arbitrum.FRAX,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      {
        address: vaults.arbitrum.Aura_rETH_xWETH,
        gauge: '0x17f061160a167d4303d5a6d32c2ac693ac87375b',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_rsETH_xWETH,
        gauge: '0x90cedfdb5284a274720f1db339eee9798f4fa29d',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_cbETH_xwstETH_rETH,
        gauge: '0x8ffd26d63724aea6a4208f2704d7ebebaa790f46',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_wstETH_xWETH,
        gauge: '0xa7bdad177d474f946f3cdeb4bcea9d24cf017471',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Convex_tBTC_xWBTC,
        gauge: '0xa4Ed1e1Db18d65A36B3Ef179AaFB549b45a635A4',
        primaryBorrowCurrency: tokens.arbitrum.WBTC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
    ],
  },
};

export default config;
