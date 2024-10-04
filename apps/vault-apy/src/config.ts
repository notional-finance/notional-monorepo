import assert from 'node:assert/strict';
import { Network, RewardPoolType, VaultDataBase } from './types';
import {
  tokens,
  vaults,
  treasuryManagerAddresses,
  AlchemyUrl,
  tradingModuleAddresses,
  DATA_SERVICE_URL,
  NetworkId,
} from '@notional-finance/util/src/constants';

import { DataServiceEndpoints } from '@notional-finance/util/src/types';

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

const dataServiceUrl = `${DATA_SERVICE_URL}/${DataServiceEndpoints.VAULT_APY}`;
const config: ConfigPerNetwork = {
  [Network.mainnet]: {
    chainId: NetworkId[Network.mainnet],
    dataServiceUrl,
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
      {
        address: vaults.mainnet.Aura_xrETH_weETH,
        gauge: '0x07A319A023859BbD49CC9C38ee891c3EA9283Cc5',
        primaryBorrowCurrency: tokens.mainnet.rETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.mainnet.Aura_ezETH_xWETH,
        gauge: '0x95eC73Baa0eCF8159b4EE897D973E41f51978E50',
        primaryBorrowCurrency: tokens.mainnet.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.mainnet.Curve_USDe_xUSDC,
        gauge: '0x04E80Db3f84873e4132B221831af1045D27f140F',
        pool: '0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72',
        primaryBorrowCurrency: tokens.mainnet.USDC,
        rewardPoolType: RewardPoolType.Curve,
      },
      {
        address: vaults.mainnet.Convex_xGHO_crvUSD,
        gauge: '0x5eC758f79b96AE74e7F1Ba9583009aFB3fc8eACB',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.ConvexMainnet,
      },
      {
        address: vaults.mainnet.Convex_xGHO_USDe,
        gauge: '0x8eD00833BE7342608FaFDbF776a696afbFEaAe96',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.Curve,
      },
      {
        address: vaults.mainnet.Balancer_rsETH_xWETH,
        gauge: '0xB5FdB4f75C26798A62302ee4959E4281667557E0',
        primaryBorrowCurrency: tokens.mainnet.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.mainnet.Convex_xWBTC_tBTC,
        gauge: '0x5793691B4ba69665213614d7ac722Db2d3f41927',
        primaryBorrowCurrency: tokens.mainnet.WBTC,
        rewardPoolType: RewardPoolType.ConvexMainnet,
      },
    ],
  },
  [Network.arbitrum]: {
    chainId: NetworkId[Network.arbitrum],
    dataServiceUrl,
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
        gauge: '0xC3c454095A988013C4D1a9166C345f7280332E1A',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_xUSDC_DAI_USDT_USDCe,
        gauge: '0x416C7Ad55080aB8e294beAd9B8857266E3B3F28E',
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
        gauge: '0x17F061160A167d4303d5a6D32C2AC693AC87375b',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_rsETH_xWETH,
        gauge: '0x90cedFDb5284a274720f1dB339eEe9798f4fa29d',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_cbETH_xwstETH_rETH,
        gauge: '0x8FFD26d63724AEa6A4208f2704d7EbEBaA790f46',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      {
        address: vaults.arbitrum.Aura_wstETH_xWETH,
        gauge: '0xa7BdaD177D474f946f3cDEB4bcea9d24Cf017471',
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
