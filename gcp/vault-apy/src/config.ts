import assert from 'node:assert/strict';
import { Network, RewardPoolType, VaultDataBase } from './types';

export type Config = {
  chainId: number;
  dataServiceUrl: string;
  alchemyUrl: string;
  addresses: Record<string, string>;
  vaults: VaultDataBase[];
};
type ConfigPerNetwork = Record<Network, Config>;

const DATA_SERVICE_URL =
  'https://data-service-dot-monitoring-agents.uc.r.appspot.com/vaultApy';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY as string;

assert(ALCHEMY_KEY, `Environment variable ALCHEMY_KEY needs to be set`);
assert(
  process.env.DATA_SERVICE_AUTH_TOKEN,
  `Environment variable DATA_SERVICE_AUTH_TOKEN needs to be set`
);

export const POOL_DECIMALS = 18;

const tokens = {
  [Network.mainnet]: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDe: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    rETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    weETH: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
    ezETH: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
  },
  [Network.arbitrum]: {
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    crvUSD: '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
    FRAX: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
};

const config: ConfigPerNetwork = {
  [Network.mainnet]: {
    chainId: 1,
    dataServiceUrl: DATA_SERVICE_URL,
    alchemyUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    addresses: {
      treasuryManager: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
      notionalOwner: '0x02479BFC7Dce53A02e26fE7baea45a0852CB0909',
      tradingModule: '0x594734c7e06C3D483466ADBCe401C6Bd269746C8',
    },
    vaults: [
      // GHO/[USDC]/USDT
      {
        address: '0xeEB885Af7C8075Aa3b93e2F95E1c0bD51c758F91',
        gauge: '0xBDD6984C3179B099E9D383ee2F44F3A57764BF7d',
        primaryBorrowCurrency: tokens.mainnet.USDC,
        rewardPoolType: RewardPoolType.Aura,
      },
      // rETH/weETH
      {
        address: '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1',
        gauge: '0x07a319a023859bbd49cc9c38ee891c3ea9283cc5',
        primaryBorrowCurrency: tokens.mainnet.rETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // ezETH/wETH
      {
        address: '0x914255c0c289AEa36E378EBB5e28293b5ED278Ca',
        gauge: '0x95ec73baa0ecf8159b4ee897d973e41f51978e50',
        primaryBorrowCurrency: tokens.mainnet.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // USDe/USDC
      {
        address: '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021',
        gauge: '0x04e80db3f84873e4132b221831af1045d27f140f',
        pool: '0x02950460e2b9529d0e00284a5fa2d7bdf3fa4d72',
        primaryBorrowCurrency: tokens.mainnet.USDC,
        rewardPoolType: RewardPoolType.Curve,
      },
      // GHO/crvUSD
      {
        address: '0x30fBa4a7ec8591f25B4D37fD79943a4bb6E553e2',
        gauge: '0x5eC758f79b96AE74e7F1Ba9583009aFB3fc8eACB',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.ConvexMainnet,
      },
      // GHO/USDe
      {
        address: '0xb1113cf888a019693b254da3d90f841072d85172',
        gauge: '0x8eD00833BE7342608FaFDbF776a696afbFEaAe96',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.Curve,
      },
      // rsETH/WETH
      {
        address: '0xf94507f3dece4cc4c73b6cf228912b85eadc9cfb',
        gauge: '0x58AAdFB1Afac0ad7fca1148f3cdE6aEDF5236B6D',
        primaryBorrowCurrency: tokens.mainnet.WETH,
        rewardPoolType: RewardPoolType.Balancer,
      },
    ],
  },
  [Network.arbitrum]: {
    chainId: 42161,
    dataServiceUrl: DATA_SERVICE_URL,
    alchemyUrl: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    addresses: {
      treasuryManager: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
      notionalOwner: '0xbf778Fc19d0B55575711B6339A3680d07352B221',
      tradingModule: '0xBf6B9c5608D520469d8c4BD1E24F850497AF0Bb8',
    },
    vaults: [
      // crvUSD/USDC
      {
        address: '0x5c36a0DeaB3531d29d848E684E8bDf5F81cDB643',
        gauge: '0xBFEE9F3E015adC754066424AEd535313dc764116',
        primaryBorrowCurrency: tokens.arbitrum.USDC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // crvUSD/USDT
      {
        address: '0xae04e4887cBf5f25c05aC1384BcD0b7e885a1F4A',
        gauge: '0xf74d4C9b0F49fb70D8Ff6706ddF39e3a16D61E67',
        primaryBorrowCurrency: tokens.arbitrum.USDT,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // WBTC/tBTC
      {
        address: '0xF95441f348eb2fd3D5D82f9B7B961137a734eEdD',
        gauge: '0x6B7B84F6EC1c019aF08C7A2F34D3C10cCB8A8eA6',
        primaryBorrowCurrency: tokens.arbitrum.WBTC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // USDC.e/USDT
      {
        address: '0x431dbfE3050eA39abBfF3E0d86109FB5BafA28fD',
        gauge: '0x971E732B5c91A59AEa8aa5B0c763E6d648362CF8',
        primaryBorrowCurrency: tokens.arbitrum.USDT,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // ezETH/wstETH
      {
        address: '0xD7c3Dc1C36d19cF4e8cea4eA143a2f4458Dd1937',
        gauge: '0xc3c454095a988013c4d1a9166c345f7280332e1a',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // USDC/DAI/USDT/USDC.e
      {
        address: '0x8ae7a8789a81a43566d0ee70264252c0db826940',
        gauge: '0x416c7ad55080ab8e294bead9b8857266e3b3f28e',
        primaryBorrowCurrency: tokens.arbitrum.USDC,
        rewardPoolType: RewardPoolType.Aura,
      },
      // FRAX/USDCe
      {
        address: '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf',
        gauge: '0x93729702Bf9E1687Ae2124e191B8fFbcC0C8A0B0',
        primaryBorrowCurrency: tokens.arbitrum.FRAX,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // "rETH_xWETH"
      {
        address: '0xA0d61c08e642103158Fc6a1495E7Ff82bAF25857',
        gauge: '0x17f061160a167d4303d5a6d32c2ac693ac87375b',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // "rsETH_xWETH":
      {
        address: '0xCAc9c01d1207e5D06bB0fD5b854832F35FE97E68',
        gauge: '0x90cedfdb5284a274720f1db339eee9798f4fa29d',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // "cbETH_xwstETH_rETH":
      {
        address: '0x91B79F4081D3522Af2760B7698810d501eBC8010',
        gauge: '0x8ffd26d63724aea6a4208f2704d7ebebaa790f46',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // wstETH/WETH
      {
        address: '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2',
        gauge: '0xa7bdad177d474f946f3cdeb4bcea9d24cf017471',
        primaryBorrowCurrency: tokens.arbitrum.WETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // "tBTC/xwBTC"
      {
        address: '0x3533f05b2c54ce1c2321cfe3c6f693a3cbbaea10',
        gauge: '0xa4Ed1e1Db18d65A36B3Ef179AaFB549b45a635A4',
        primaryBorrowCurrency: tokens.arbitrum.WBTC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
    ],
  },
};

export default config;
