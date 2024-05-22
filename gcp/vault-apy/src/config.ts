import assert from 'node:assert/strict';
import { Network, VaultTypes, VaultData } from './types';

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
assert(process.env.DATA_SERVICE_AUTH_TOKEN,`Environment variable DATA_SERVICE_AUTH_TOKEN needs to be set`)

////////////////////////// MAINNET ////////////////////////
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
////////////////////////// ARBITRUM ///////////////////////
const ARB_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const ARB_USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';


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
      // GHO/USDC/USDT
      {
        address: '0xeEB885Af7C8075Aa3b93e2F95E1c0bD51c758F91',
        gauge: '0xBDD6984C3179B099E9D383ee2F44F3A57764BF7d',
        primaryBorrowCurrency: USDC,
        type: VaultTypes.Aura,

      },
      // rETH/weETH
      {
        address: '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1',
        gauge: '0x07a319a023859bbd49cc9c38ee891c3ea9283cc5',
        primaryBorrowCurrency: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        type: VaultTypes.Aura,
      },
      // ezETH/wETH
      {
        address: '0x914255c0c289AEa36E378EBB5e28293b5ED278Ca',
        gauge: '0x95ec73baa0ecf8159b4ee897d973e41f51978e50',
        primaryBorrowCurrency: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        type: VaultTypes.Aura,
      },
      // USDe/USDC
      {
        address: '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021',
        gauge: '0x04e80db3f84873e4132b221831af1045d27f140f',
        primaryBorrowCurrency: USDC,
        type: VaultTypes.Curve,
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
        primaryBorrowCurrency: ARB_USDC,
        type: VaultTypes.Convex,
      },
      // crvUSD/USDT
      {
        address: '0xae04e4887cBf5f25c05aC1384BcD0b7e885a1F4A',
        gauge: '0xf74d4C9b0F49fb70D8Ff6706ddF39e3a16D61E67',
        primaryBorrowCurrency: ARB_USDT,
        type: VaultTypes.Convex,
      },
      // WBTC/tBTC
      {
        address: '0xF95441f348eb2fd3D5D82f9B7B961137a734eEdD',
        gauge: '0x6B7B84F6EC1c019aF08C7A2F34D3C10cCB8A8eA6',
        primaryBorrowCurrency: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        type: VaultTypes.Convex,
      },
      // USDC.e/USDT
      {
        address: '0x431dbfE3050eA39abBfF3E0d86109FB5BafA28fD',
        gauge: '0x971E732B5c91A59AEa8aa5B0c763E6d648362CF8',
        primaryBorrowCurrency: ARB_USDT,
        type: VaultTypes.Convex,
      },
      // ezETH/wstETH
      {
        address: '0xD7c3Dc1C36d19cF4e8cea4eA143a2f4458Dd1937',
        gauge: '0xc3c454095a988013c4d1a9166c345f7280332e1a',
        primaryBorrowCurrency: '0x5979D7b546E38E414F7E9822514be443A4800529',
        type: VaultTypes.Aura,
      },
      // USDC/DAI/USDT/USDC.e
      {
        address: '0x8ae7a8789a81a43566d0ee70264252c0db826940',
        gauge: '0x416c7ad55080ab8e294bead9b8857266e3b3f28e',
        primaryBorrowCurrency: ARB_USDC,
        type: VaultTypes.Aura,
      },
    ],
  },
};

export default config;
