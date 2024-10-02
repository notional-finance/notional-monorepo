import { BigNumber, ethers } from 'ethers';

export const UNLIMITED_APPROVAL = BigNumber.from(2).pow(96);
export const INTERNAL_TOKEN_PRECISION = 1e8;
export const INTERNAL_TOKEN_DECIMALS = 8;
export const RATE_PRECISION = 1e9;
export const RATE_DECIMALS = 9;
export const SCALAR_PRECISION = BigNumber.from(10).pow(18);
export const SCALAR_DECIMALS = 18;
export const ZERO_ADDRESS = ethers.constants.AddressZero;
export const BASIS_POINT = 1e5;
export const DELEVERAGE_BUFFER = 300 * BASIS_POINT;
export const PERCENTAGE_BASIS = 100;
export const INTERNAL_PRECISION_DUST = 5000;
export const FLOATING_POINT_DUST = 5e-5;
export enum HEALTH_FACTOR_RISK_LEVELS {
  HIGH_RISK = 1.25,
  MEDIUM_RISK = 2.5,
  LOW_RISK = 5,
}

export const ONE_SECOND_MS = 1_000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const SECONDS_IN_DAY = 86400;
export const SECONDS_IN_HOUR = 3600;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * 6;
export const ONE_WEEK = SECONDS_IN_DAY * 7;
export const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;
export const SECONDS_IN_QUARTER = 90 * SECONDS_IN_DAY;
export const SECONDS_IN_YEAR = SECONDS_IN_QUARTER * 4;
export const SECONDS_IN_YEAR_ACTUAL = 31536000;
export const PRIME_CASH_VAULT_MATURITY = 2 ** 40 - 1;
export const MAX_APPROVAL = ethers.constants.MaxUint256;
export const ALT_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const SETTLEMENT_RESERVE = '0x00000000000000000000000000000000000005e7';
export const FEE_RESERVE = '0x0000000000000000000000000000000000000FEE';
export const MAX_UINT88 = BigNumber.from(2).pow(88).sub(1);
export const IS_LOCAL_ENV =
  process.env['NODE_ENV'] === 'development' ||
  process.env['NODE_ENV'] === 'test';
export const IS_TEST_ENV = process.env['NODE_ENV'] === 'test';

export enum Network {
  all = 'all',
  mainnet = 'mainnet',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
}

export const NetworkId: Record<Network, number> = {
  [Network.all]: 1,
  [Network.mainnet]: 1,
  [Network.arbitrum]: 42161,
  [Network.optimism]: 10,
};

export const SupportedNetworks = [Network.arbitrum, Network.mainnet];
export const STABLE_COINS = ['USDC', 'USDT', 'DAI', 'FRAX', 'sDAI'];
export const LSDS = ['wstETH', 'cbETH', 'rETH'];
export const NATIVE_YIELD = [...LSDS, 'sDAI'];

export const DATA_SERVICE_URL =
  'https://us-central1-monitoring-agents.cloudfunctions.net/data-service/vaultApy';

export const AlchemyUrl: Record<Network, string> = {
  [Network.all]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.mainnet]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.arbitrum]: 'https://arb-mainnet.g.alchemy.com/v2',
  [Network.optimism]: 'https://opt-mainnet.g.alchemy.com/v2',
};

export const AlchemyNFTUrl: Record<Network, string> = {
  [Network.all]: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  [Network.mainnet]: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  [Network.arbitrum]: 'https://arb-mainnet.g.alchemy.com/nft/v2',
  [Network.optimism]: 'https://opt-mainnet.g.alchemy.com/nft/v2',
};

export const NotionalAddress: Record<Network, string> = {
  [Network.all]: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f',
  [Network.mainnet]: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f',
  [Network.arbitrum]: '0x1344A36A1B56144C3Bc62E7757377D288fDE0369',
  [Network.optimism]: '',
};

export const treasuryManagerAddresses = {
  [Network.mainnet]: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
  [Network.arbitrum]: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
};

export const managerBotAddresses = {
  [Network.mainnet]: '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed',
  [Network.arbitrum]: '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed',
};

export const tradingModuleAddresses = {
  [Network.mainnet]: '0x594734c7e06C3D483466ADBCe401C6Bd269746C8',
  [Network.arbitrum]: '0xBf6B9c5608D520469d8c4BD1E24F850497AF0Bb8',
};

export const SubgraphId: Record<Network, string> = {
  [Network.all]: '4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW',
  [Network.mainnet]: '4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW',
  [Network.arbitrum]: 'DnghsCNvJ4xmp4czX8Qn7UpkJ8HyHjy7cFN4wcH91Nrx',
  [Network.optimism]: '',
};

export function getSubgraphEndpoint(network: Network, subgraphKey: string) {
  return `https://gateway-arbitrum.network.thegraph.com/api/${subgraphKey}/subgraphs/id/${SubgraphId[network]}`;
}

export const sNOTE = '0x38de42f4ba8a35056b33a746a6b45be9b1c3b9d2';

export const ORACLE_TYPE_TO_ID = {
  Chainlink: 1,
  VaultShareOracleRate: 2,
  fCashOracleRate: 3,
  nTokenToUnderlyingExchangeRate: 4,
  fCashToUnderlyingExchangeRate: 5,
  fCashSettlementRate: 6,
  fCashSpotRate: 7,
  PrimeDebtSpotInterestRate: 8,
  PrimeDebtToUnderlyingExchangeRate: 9,
  PrimeCashSpotInterestRate: 10,
  PrimeCashToUnderlyingExchangeRate: 11,
  PrimeDebtPremiumInterestRate: 12,
  PrimeCashPremiumInterestRate: 13,
  sNOTE: 14,
};

// This kludge is necessary because the subgraph only allows a skip value of
// less than 5000, so we query the entire account range by the prefix here with
// a max number of accounts in each id range of 5000.
export const ACCOUNT_ID_RANGES = [
  '0x0000000000000000000000000000000000000000',
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000',
  '0x3000000000000000000000000000000000000000',
  '0x4000000000000000000000000000000000000000',
  '0x5000000000000000000000000000000000000000',
  '0x6000000000000000000000000000000000000000',
  '0x7000000000000000000000000000000000000000',
  '0x8000000000000000000000000000000000000000',
  '0x9000000000000000000000000000000000000000',
  '0xa000000000000000000000000000000000000000',
  '0xb000000000000000000000000000000000000000',
  '0xc000000000000000000000000000000000000000',
  '0xd000000000000000000000000000000000000000',
  '0xe000000000000000000000000000000000000000',
  '0xf000000000000000000000000000000000000000',
  '0xffffffffffffffffffffffffffffffffffffffff',
];

// all addresses must be properly checksummed
export const tokens = {
  [Network.mainnet]: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    rETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    CVX: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    BAL: '0xba100000625a3754423978a60c9317c58a424e3D',
    AURA: '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
  },
  [Network.arbitrum]: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    BAL: '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8',
    AURA: '0x1509706a6c66CA549ff0cB464de88231DDBe213B',
    CRV: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
    ARB: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    USDCe: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    FRAX: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
  },
};

export const vaults = {
  [Network.mainnet]: {
    Convex_pyUSD_xUSDC: '0x84e58d8faA4e3B74d55D9fc762230f15d95570B8',
    Convex_xUSDC_crvUSD: '0xba4eb30f7F2e378249cf94E08F581e704326e9c6',
    Convex_xUSDT_crvUSD: '0x86B222d44AC6cC56e75b3df01fdAD5Dc371EF538',
    Aura_GHO_USDT_xUSDC: '0xeEB885Af7C8075Aa3b93e2F95E1c0bD51c758F91',
    Aura_ezETH_xWETH: '0x914255c0c289AEa36E378EBB5e28293b5ED278Ca',
    Aura_xrETH_weETH: '0x32D82A1C8618c7Be7Fe85B2F1C44357A871d52D1',
    Convex_xGHO_crvUSD: '0x30fBa4a7ec8591f25B4D37fD79943a4bb6E553e2',
    Balancer_rsETH_xWETH: '0xF94507F3dECE4CC4c73B6cf228912b85Eadc9CFB',
    Curve_USDe_xUSDC: '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021',
    Convex_xGHO_USDe: '0xb1113cf888a019693b254da3d90f841072d85172',
  },
  [Network.arbitrum]: {
    Curve_xFRAX_USDC: '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf',
    Convex_USDCe_xUSDT: '0x431dbfE3050eA39abBfF3E0d86109FB5BafA28fD',
    Convex_crvUSD_xUSDC: '0x5c36a0DeaB3531d29d848E684E8bDf5F81cDB643',
    Convex_crvUSD_xUSDT: '0xae04e4887cBf5f25c05aC1384BcD0b7e885a1F4A',
    Convex_xWBTC_tBTC: '0xF95441f348eb2fd3D5D82f9B7B961137a734eEdD',
    Aura_xrETH_WETH: '0x3Df035433cFACE65b6D68b77CC916085d020C8B8',
    Aura_xUSDC_DAI_USDT_USDCe: '0x8Ae7A8789A81A43566d0ee70264252c0DB826940',
    Aura_wstETH_xWETH: '0x0E8C1A069f40D0E8Fa861239D3e62003cBF3dCB2',
    Aura_xwstETH_cbETH_rETH: '0x37dD23Ab1885982F789A2D6400B583B8aE09223d',
    Aura_ezETH_xwstETH: '0xD7c3Dc1C36d19cF4e8cea4eA143a2f4458Dd1937',
    Aura_rETH_xWETH: '0xA0d61c08e642103158Fc6a1495E7Ff82bAF25857',
    Aura_rsETH_xWETH: '0xCAc9c01d1207e5D06bB0fD5b854832F35FE97E68',
    Aura_cbETH_xwstETH_rETH: '0x91B79F4081D3522Af2760B7698810d501eBC8010',
    Convex_tBTC_xWBTC: '0x3533F05B2C54Ce1C2321cfe3c6F693A3cBbAEa10',
  },
};

export const WETHAddress: Record<Network, string> = {
  [Network.all]: tokens.mainnet.WETH,
  [Network.mainnet]: tokens.mainnet.WETH,
  [Network.arbitrum]: tokens.arbitrum.WETH,
  [Network.optimism]: '',
};
