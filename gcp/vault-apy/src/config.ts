import assert from 'node:assert/strict';
import { Network, RewardPoolType, VaultData } from './types';

export type Config = {
  chainId: number,
  dataServiceUrl: string,
  alchemyUrl: string,
  addresses: Record<string, string>,
  vaults: VaultData[],
};
type ConfigPerNetwork = Record<Network, Config>;

const DATA_SERVICE_URL = 'https://data-service-dot-monitoring-agents.uc.r.appspot.com/vaultApy';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY as string;

assert(ALCHEMY_KEY, `Environment variable ALCHEMY_KEY needs to be set`);
assert(process.env.DATA_SERVICE_AUTH_TOKEN, `Environment variable DATA_SERVICE_AUTH_TOKEN needs to be set`)


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
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529'
  }
}

export const getTokenDecimals = (token: string) => {
  if ([tokens.mainnet.USDC, tokens.mainnet.USDT, tokens.arbitrum.USDT, tokens.arbitrum.USDC].includes(token)) {
    return 6;
  }
  return 18;
}
const config: ConfigPerNetwork = {
  [Network.mainnet]: {
    chainId: 1,
    dataServiceUrl: DATA_SERVICE_URL,
    alchemyUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    addresses: {
      treasuryManager: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
      notionalOwner: '0x22341fB5D92D3d801144aA5A925F401A91418A05',
      tradingModule: '0x594734c7e06C3D483466ADBCe401C6Bd269746C8',
    },
    vaults: [
      // // GHO/[USDC]/USDT
      {
        address: '0xeEB885Af7C8075Aa3b93e2F95E1c0bD51c758F91',
        gauge: '0xBDD6984C3179B099E9D383ee2F44F3A57764BF7d',
        pool: '0x8353157092ed8be69a9df8f95af097bbf33cb2af',
        BPTIndex: 1,
        primaryBorrowCurrency: tokens.mainnet.USDC,
        rewardPoolType: RewardPoolType.Aura,

      },
      // rETH/weETH
      {
        address: '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1',
        gauge: '0x07a319a023859bbd49cc9c38ee891c3ea9283cc5',
        pool: '0x05ff47AFADa98a98982113758878F9A8B9FddA0a',
        BPTIndex: 0,
        primaryBorrowCurrency: tokens.mainnet.rETH,
        rewardPoolType: RewardPoolType.Aura,
      },
      // ezETH/wETH
      {
        address: '0x914255c0c289AEa36E378EBB5e28293b5ED278Ca',
        gauge: '0x95ec73baa0ecf8159b4ee897d973e41f51978e50',
        pool: '0x596192bB6e41802428Ac943D2f1476C1Af25CC0E',
        BPTIndex: 0,
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
        pool: '0x635EF0056A597D13863B73825CcA297236578595',
        primaryBorrowCurrency: tokens.mainnet.GHO,
        rewardPoolType: RewardPoolType.ConvexMainnet,
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
        pool: '0xec090cf6DD891D2d014beA6edAda6e05E025D93d',
        primaryBorrowCurrency: tokens.arbitrum.USDC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // crvUSD/USDT
      {
        address: '0xae04e4887cBf5f25c05aC1384BcD0b7e885a1F4A',
        gauge: '0xf74d4C9b0F49fb70D8Ff6706ddF39e3a16D61E67',
        pool: '0x73aF1150F265419Ef8a5DB41908B700C32D49135',
        primaryBorrowCurrency: tokens.arbitrum.USDT,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // WBTC/tBTC
      {
        address: '0xF95441f348eb2fd3D5D82f9B7B961137a734eEdD',
        gauge: '0x6B7B84F6EC1c019aF08C7A2F34D3C10cCB8A8eA6',
        pool: '0x755D6688AD74661Add2FB29212ef9153D40fcA46',
        primaryBorrowCurrency: tokens.arbitrum.WBTC,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // USDC.e/USDT
      {
        address: '0x431dbfE3050eA39abBfF3E0d86109FB5BafA28fD',
        gauge: '0x971E732B5c91A59AEa8aa5B0c763E6d648362CF8',
        pool: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
        primaryBorrowCurrency: tokens.arbitrum.USDT,
        rewardPoolType: RewardPoolType.ConvexArbitrum,
      },
      // ezETH/wstETH
      {
        address: '0xD7c3Dc1C36d19cF4e8cea4eA143a2f4458Dd1937',
        gauge: '0xc3c454095a988013c4d1a9166c345f7280332e1a',
        pool: '0xB61371Ab661B1ACec81C699854D2f911070C059E',
        primaryBorrowCurrency: tokens.arbitrum.wstETH,
        BPTIndex: 2,
        rewardPoolType: RewardPoolType.Aura,
      },
      // USDC/DAI/USDT/USDC.e
      {
        address: '0x8ae7a8789a81a43566d0ee70264252c0db826940',
        gauge: '0x416c7ad55080ab8e294bead9b8857266e3b3f28e',
        pool: '0x423A1323c871aBC9d89EB06855bF5347048Fc4A5',
        primaryBorrowCurrency: tokens.arbitrum.USDC,
        BPTIndex: 0,
        rewardPoolType: RewardPoolType.Aura,
      },
    ],
  },
};

export default config;
